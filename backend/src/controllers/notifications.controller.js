const prisma = require('../models/prisma');

class NotificationsController {
    // Get user notifications
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, unreadOnly = false } = req.query;

            const where = { userId };
            if (unreadOnly === 'true') {
                where.read = false;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [notifications, total, unreadCount] = await Promise.all([
                prisma.notification.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.notification.count({ where }),
                prisma.notification.count({
                    where: { userId, read: false }
                })
            ]);

            res.json({
                success: true,
                notifications,
                unreadCount,
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

    // Mark notification as read
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const notification = await prisma.notification.findUnique({
                where: { id }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            if (notification.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const updated = await prisma.notification.update({
                where: { id },
                data: { read: true }
            });

            res.json({
                success: true,
                notification: updated
            });
        } catch (error) {
            next(error);
        }
    }

    // Mark all notifications as read
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;

            await prisma.notification.updateMany({
                where: {
                    userId,
                    read: false
                },
                data: { read: true }
            });

            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete notification
    async deleteNotification(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const notification = await prisma.notification.findUnique({
                where: { id }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            if (notification.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await prisma.notification.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Notification deleted'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get unread count
    async getUnreadCount(req, res, next) {
        try {
            const userId = req.user.id;

            const count = await prisma.notification.count({
                where: {
                    userId,
                    read: false
                }
            });

            res.json({
                success: true,
                count
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationsController();
