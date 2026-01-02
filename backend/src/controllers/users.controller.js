const prisma = require('../models/prisma');
const s3Service = require('../services/s3.service');
const bcrypt = require('bcryptjs');

class UsersController {
    // Get user profile
    async getProfile(req, res, next) {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    image: true,
                    phone: true,
                    address: true,
                    role: true,
                    isVendor: true,
                    rating: true,
                    totalRatings: true,
                    emailVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            listings: true,
                            bids: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user
            });
        } catch (error) {
            next(error);
        }
    }

    // Update user profile
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, username, phone, address } = req.body;

            // Check if username is taken
            if (username) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username,
                        NOT: { id: userId }
                    }
                });

                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username already taken'
                    });
                }
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (username !== undefined) updateData.username = username;
            if (phone !== undefined) updateData.phone = phone;
            if (address !== undefined) updateData.address = address;

            const user = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    image: true,
                    phone: true,
                    address: true,
                    role: true,
                    isVendor: true
                }
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    // Update avatar
    async updateAvatar(req, res, next) {
        try {
            const userId = req.user.id;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }

            // Get current user to delete old avatar
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { image: true }
            });

            // Upload new avatar
            const imageUrl = await s3Service.uploadImage(req.file);

            // Update user
            const user = await prisma.user.update({
                where: { id: userId },
                data: { image: imageUrl },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    image: true,
                    role: true
                }
            });

            // Delete old avatar (async)
            if (currentUser.image) {
                s3Service.deleteImage(currentUser.image)
                    .catch(err => console.error('Error deleting old avatar:', err));
            }

            res.json({
                success: true,
                message: 'Avatar updated successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    // Change password
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Get user with password
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, user.password);

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete account
    async deleteAccount(req, res, next) {
        try {
            const userId = req.user.id;

            // Check for active listings
            const activeListings = await prisma.listing.count({
                where: {
                    sellerId: userId,
                    status: { in: ['LIVE', 'UPCOMING'] }
                }
            });

            if (activeListings > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete account with active listings'
                });
            }

            // Check for pending payments
            const pendingPayments = await prisma.payment.count({
                where: {
                    OR: [
                        { buyerId: userId },
                        { sellerId: userId }
                    ],
                    status: 'pending'
                }
            });

            if (pendingPayments > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete account with pending payments'
                });
            }

            // Delete user (cascade will handle related records)
            await prisma.user.delete({
                where: { id: userId }
            });

            res.json({
                success: true,
                message: 'Account deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get user statistics
    async getStats(req, res, next) {
        try {
            const userId = req.user.id;

            const [
                totalListings,
                activeListings,
                soldListings,
                totalBids,
                wonAuctions,
                totalSpent,
                totalEarned
            ] = await Promise.all([
                prisma.listing.count({
                    where: { sellerId: userId }
                }),
                prisma.listing.count({
                    where: {
                        sellerId: userId,
                        status: { in: ['LIVE', 'UPCOMING'] }
                    }
                }),
                prisma.listing.count({
                    where: {
                        sellerId: userId,
                        status: 'SOLD'
                    }
                }),
                prisma.bid.count({
                    where: { bidderId: userId }
                }),
                prisma.bid.count({
                    where: {
                        bidderId: userId,
                        status: 'WON'
                    }
                }),
                prisma.payment.aggregate({
                    where: {
                        buyerId: userId,
                        status: 'succeeded'
                    },
                    _sum: { amount: true }
                }),
                prisma.payment.aggregate({
                    where: {
                        sellerId: userId,
                        status: 'succeeded'
                    },
                    _sum: { amount: true }
                })
            ]);

            res.json({
                success: true,
                stats: {
                    listings: {
                        total: totalListings,
                        active: activeListings,
                        sold: soldListings
                    },
                    bids: {
                        total: totalBids,
                        won: wonAuctions
                    },
                    financial: {
                        totalSpent: totalSpent._sum.amount || 0,
                        totalEarned: totalEarned._sum.amount || 0
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UsersController();
