const prisma = require('../models/prisma');
const s3Service = require('../services/s3.service');
const socketService = require('../socket');

class ListingsController {
    // Get all listings with filters
    async getAll(req, res, next) {
        try {
            const {
                page = 1,
                limit = 12,
                status,
                category,
                minPrice = 0,
                maxPrice = 999999999,
                search,
                sellerId,
                timeRemaining,
                sortBy = 'newly-listed'
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            const now = new Date();

            // Status filter - default to LIVE if not specified
            if (status) {
                const statusUpper = status.toUpperCase();
                if (statusUpper === 'ALL') {
                    // No status filter
                } else if (statusUpper === 'LIVE') {
                    where.status = 'LIVE';
                } else if (statusUpper === 'ENDING-SOON') {
                    where.status = 'LIVE';
                    const endingSoonTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    where.endTime = {
                        lte: endingSoonTime,
                        gte: now
                    };
                } else if (statusUpper === 'UPCOMING') {
                    where.status = 'UPCOMING';
                } else if (['ENDED', 'SOLD', 'UNSOLD'].includes(statusUpper)) {
                    where.status = statusUpper;
                }
            } else {
                // Default to LIVE status when no status filter is provided
                where.status = 'LIVE';
            }

            // Category filter
            if (category && category !== 'all') {
                where.category = category;
            }

            // Price range filter
            if (parseFloat(minPrice) > 0 || parseFloat(maxPrice) < 999999999) {
                where.currentBid = {
                    gte: parseFloat(minPrice),
                    lte: parseFloat(maxPrice)
                };
            }

            // Time remaining filter
            if (timeRemaining && timeRemaining !== 'any') {
                if (!where.status) {
                    where.status = 'LIVE';
                }

                let endTimeLimit;
                switch (timeRemaining) {
                    case 'hour':
                        endTimeLimit = new Date(now.getTime() + 60 * 60 * 1000);
                        break;
                    case 'day':
                        endTimeLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                        break;
                    case 'week':
                        endTimeLimit = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        break;
                }

                if (endTimeLimit) {
                    where.endTime = {
                        ...(where.endTime || {}),
                        lte: endTimeLimit,
                        gte: now
                    };
                }
            }

            // Full-text search
            if (search && search.trim()) {
                where.OR = [
                    { title: { contains: search.trim(), mode: 'insensitive' } },
                    { description: { contains: search.trim(), mode: 'insensitive' } }
                ];
            }

            // Seller filter
            if (sellerId) {
                where.sellerId = sellerId;
            }

            // Build orderBy
            let orderBy = {};
            switch (sortBy) {
                case 'ending-soonest':
                    orderBy = { endTime: 'asc' };
                    break;
                case 'newly-listed':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'most-bids':
                    orderBy = { bidCount: 'desc' };
                    break;
                case 'price-low-high':
                    orderBy = { currentBid: 'asc' };
                    break;
                case 'price-high-low':
                    orderBy = { currentBid: 'desc' };
                    break;
                default:
                    orderBy = { createdAt: 'desc' };
            }

            // Fetch listings and total count
            const [listings, total] = await Promise.all([
                prisma.listing.findMany({
                    where,
                    include: {
                        seller: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                image: true,
                                rating: true,
                                totalRatings: true
                            }
                        },
                        _count: {
                            select: {
                                bids: true
                            }
                        }
                    },
                    orderBy,
                    skip,
                    take: parseInt(limit)
                }),
                prisma.listing.count({ where })
            ]);

            res.json({
                success: true,
                listings,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    hasMore: skip + parseInt(limit) < total
                },
                appliedFilters: {
                    status,
                    category,
                    minPrice,
                    maxPrice,
                    search,
                    sortBy,
                    timeRemaining
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single listing by ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const listing = await prisma.listing.findUnique({
                where: { id },
                include: {
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true,
                            phone: true,
                            address: true,
                            rating: true,
                            totalRatings: true,
                            isVendor: true,
                            createdAt: true
                        }
                    },
                    bids: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                        include: {
                            bidder: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            bids: true
                        }
                    }
                }
            });

            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            // Increment view count (async)
            prisma.listing.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            }).catch(err => console.error('Error updating view count:', err));

            // Get highest bid
            const highestBid = listing.bids.length > 0 ? listing.bids[0] : null;

            // Calculate time remaining
            const now = new Date();
            const endTime = new Date(listing.endTime);
            const timeRemaining = endTime - now;
            const isActive = listing.status === 'LIVE' && timeRemaining > 0;

            res.json({
                success: true,
                listing: {
                    ...listing,
                    highestBid,
                    bidCount: listing._count.bids,
                    timeRemaining: Math.max(0, timeRemaining),
                    isActive
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Create new listing
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            console.log('📝 Creating listing for user:', userId);

            const {
                title,
                description,
                category,
                startingPrice,
                reservePrice,
                buyNowPrice,
                startTime,
                endTime,
                duration,
                images,
                videos
            } = req.body;

            // Validate required fields
            if (!title || !description || !category || !startingPrice) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Parse start time - if not provided, use current time
            let start;
            if (startTime) {
                start = new Date(startTime);
                if (isNaN(start.getTime())) {
                    start = new Date();
                }
            } else {
                start = new Date();
            }

            // Parse end time
            let end;
            if (endTime) {
                end = new Date(endTime);
                if (isNaN(end.getTime()) || end <= start) {
                    // Invalid end time, calculate from duration or default to 24 hours
                    const durationHours = duration ? parseInt(duration) : 24;
                    end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
                }
            } else if (duration) {
                // Calculate from duration
                end = new Date(start.getTime() + parseInt(duration) * 60 * 60 * 1000);
            } else {
                // Default to 24 hours
                end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
            }

            const now = new Date();

            // Determine status
            let status = 'UPCOMING';
            if (start <= new Date(now.getTime() + 5 * 60 * 1000)) {
                status = 'LIVE';
            }

            // Calculate duration in hours
            const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));

            console.log('Creating listing with:', { title, start, end, status, durationHours });

            // Create listing
            const listing = await prisma.listing.create({
                data: {
                    title,
                    description,
                    category,
                    images: images || [],
                    videos: videos || [],
                    startingPrice: parseFloat(startingPrice),
                    reservePrice: reservePrice ? parseFloat(reservePrice) : null,
                    buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
                    currentBid: parseFloat(startingPrice),
                    startTime: start,
                    endTime: end,
                    duration: durationHours,
                    status,
                    sellerId: userId
                },
                include: {
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    }
                }
            });

            // Emit new listing event
            socketService.broadcastToAll('newListing', listing);

            res.status(201).json({
                success: true,
                message: 'Listing created successfully',
                listing
            });
        } catch (error) {
            next(error);
        }
    }

    // Update listing
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if listing exists and belongs to user
            const listing = await prisma.listing.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            bids: true
                        }
                    }
                }
            });

            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (listing.sellerId !== userId && req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own listings'
                });
            }

            // Check if listing has bids
            if (listing._count.bids > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update listing with existing bids'
                });
            }

            // Check if listing is still UPCOMING
            if (listing.status !== 'UPCOMING') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only update UPCOMING listings'
                });
            }

            const {
                title,
                description,
                category,
                startingPrice,
                reservePrice,
                buyNowPrice,
                startTime,
                duration,
                images,
                videos
            } = req.body;

            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (category !== undefined) updateData.category = category;
            if (images !== undefined) updateData.images = images;
            if (videos !== undefined) updateData.videos = videos;
            if (startingPrice !== undefined) {
                updateData.startingPrice = parseFloat(startingPrice);
                updateData.currentBid = parseFloat(startingPrice);
            }
            if (reservePrice !== undefined) updateData.reservePrice = reservePrice ? parseFloat(reservePrice) : null;
            if (buyNowPrice !== undefined) updateData.buyNowPrice = buyNowPrice ? parseFloat(buyNowPrice) : null;

            if (startTime !== undefined || duration !== undefined) {
                const start = startTime ? new Date(startTime) : listing.startTime;
                const durationHours = duration !== undefined ? parseInt(duration) : listing.duration;
                updateData.startTime = start;
                updateData.duration = durationHours;
                updateData.endTime = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

                // Update status
                const now = new Date();
                if (start <= new Date(now.getTime() + 5 * 60 * 1000)) {
                    updateData.status = 'LIVE';
                }
            }

            const updatedListing = await prisma.listing.update({
                where: { id },
                data: updateData,
                include: {
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Listing updated successfully',
                listing: updatedListing
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete listing
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const listing = await prisma.listing.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            bids: true
                        }
                    }
                }
            });

            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (listing.sellerId !== userId && req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own listings'
                });
            }

            if (listing._count.bids > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete listing with existing bids'
                });
            }

            // Delete images from S3
            if (listing.images && listing.images.length > 0) {
                for (const imageUrl of listing.images) {
                    try {
                        await s3Service.deleteImage(imageUrl);
                    } catch (err) {
                        console.error('Error deleting image:', err);
                    }
                }
            }

            // Delete videos from S3
            if (listing.videos && listing.videos.length > 0) {
                for (const videoUrl of listing.videos) {
                    try {
                        await s3Service.deleteVideo(videoUrl);
                    } catch (err) {
                        console.error('Error deleting video:', err);
                    }
                }
            }

            await prisma.listing.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Listing deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get user's listings
    async getMyListings(req, res, next) {
        try {
            const userId = req.user.id;
            const { status, page = 1, limit = 10 } = req.query;

            const where = { sellerId: userId };
            if (status) {
                where.status = status.toUpperCase();
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [listings, total] = await Promise.all([
                prisma.listing.findMany({
                    where,
                    include: {
                        _count: {
                            select: {
                                bids: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.listing.count({ where })
            ]);

            res.json({
                success: true,
                listings,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ListingsController();
