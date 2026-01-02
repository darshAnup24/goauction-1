const prisma = require('../models/prisma');
const socketService = require('../socket');

class NotificationService {
    /**
     * Create a notification and emit Socket.IO event
     */
    async createNotification({ userId, type, message, link = null }) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type,
                    message,
                    link,
                    read: false
                }
            });

            // Emit Socket.IO event for real-time update
            try {
                socketService.emitToUser(userId, 'notification', {
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                    link: notification.link,
                    read: false,
                    createdAt: notification.createdAt
                });
            } catch (socketError) {
                console.error('Socket.IO emit error:', socketError.message);
            }

            return notification;
        } catch (error) {
            console.error('Failed to create notification:', error);
            throw error;
        }
    }

    /**
     * Notify seller when a bid is placed
     */
    async notifyBidPlaced({ sellerId, bidAmount, listingId, listingTitle, bidderName }) {
        return this.createNotification({
            userId: sellerId,
            type: 'BID_PLACED',
            message: `${bidderName} placed a bid of $${bidAmount.toFixed(2)} on ${listingTitle}`,
            link: `/listings/${listingId}`
        });
    }

    /**
     * Notify previous bidder they've been outbid
     */
    async notifyOutbid({ bidderId, listingId, listingTitle, newBidAmount }) {
        return this.createNotification({
            userId: bidderId,
            type: 'BID_OUTBID',
            message: `You've been outbid on ${listingTitle}. New bid: $${newBidAmount.toFixed(2)}`,
            link: `/listings/${listingId}`
        });
    }

    /**
     * Notify winner when auction ends
     */
    async notifyAuctionWon({ winnerId, listingId, listingTitle, finalBid }) {
        return this.createNotification({
            userId: winnerId,
            type: 'AUCTION_WON',
            message: `Congratulations! You won ${listingTitle} for $${finalBid.toFixed(2)}`,
            link: `/dashboard/orders`
        });
    }

    /**
     * Notify bidder they lost the auction
     */
    async notifyAuctionLost({ bidderId, listingId, listingTitle }) {
        return this.createNotification({
            userId: bidderId,
            type: 'AUCTION_LOST',
            message: `Auction ended. Unfortunately, you didn't win ${listingTitle}`,
            link: `/listings/${listingId}`
        });
    }

    /**
     * Notify user auction is starting soon
     */
    async notifyAuctionStarting({ userId, listingId, listingTitle }) {
        return this.createNotification({
            userId,
            type: 'AUCTION_STARTING',
            message: `Auction starting soon: ${listingTitle}`,
            link: `/listings/${listingId}`
        });
    }

    /**
     * Notify user auction is ending soon
     */
    async notifyAuctionEnding({ userId, listingId, listingTitle, timeLeft }) {
        return this.createNotification({
            userId,
            type: 'AUCTION_ENDING_SOON',
            message: `Only ${timeLeft} minutes left! Auction ending soon: ${listingTitle}`,
            link: `/listings/${listingId}`
        });
    }

    /**
     * Notify seller payment was received
     */
    async notifyPaymentReceived({ sellerId, listingId, listingTitle, amount, buyerName }) {
        return this.createNotification({
            userId: sellerId,
            type: 'PAYMENT_RECEIVED',
            message: `Payment of $${amount.toFixed(2)} received from ${buyerName} for ${listingTitle}`,
            link: `/dashboard/sales`
        });
    }

    /**
     * Get user's notifications
     */
    async getUserNotifications(userId, { skip = 0, take = 20, unreadOnly = false } = {}) {
        const where = { userId };
        if (unreadOnly) {
            where.read = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, read: false } })
        ]);

        return {
            notifications,
            total,
            unreadCount,
            hasMore: skip + take < total
        };
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        return prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId
            },
            data: {
                read: true
            }
        });
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: {
                userId,
                read: false
            },
            data: {
                read: true
            }
        });
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, userId) {
        return prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId
            }
        });
    }

    /**
     * Delete old read notifications (cleanup)
     */
    async cleanupOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await prisma.notification.deleteMany({
            where: {
                read: true,
                createdAt: {
                    lt: cutoffDate
                }
            }
        });

        console.log(`🧹 Cleaned up ${result.count} old notifications`);
        return result;
    }
}

module.exports = new NotificationService();
