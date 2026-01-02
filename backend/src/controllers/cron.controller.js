const prisma = require('../models/prisma');
const emailService = require('../services/email.service');
const socketService = require('../socket');

class CronController {
    // Expire ended auctions
    async expireAuctions(req, res, next) {
        try {
            // Verify cron secret
            const cronSecret = req.headers['x-cron-secret'];
            if (cronSecret !== process.env.CRON_SECRET) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            const now = new Date();

            // Find all LIVE auctions that have ended
            const endedAuctions = await prisma.listing.findMany({
                where: {
                    status: 'LIVE',
                    endTime: {
                        lte: now
                    }
                },
                include: {
                    bids: {
                        where: { status: 'WINNING' },
                        include: {
                            bidder: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    username: true
                                }
                            }
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            const results = {
                sold: 0,
                unsold: 0,
                total: endedAuctions.length,
                processed: []
            };

            for (const listing of endedAuctions) {
                try {
                    const winningBid = listing.bids[0];

                    if (winningBid) {
                        // Auction has winner
                        if (listing.reservePrice && listing.currentBid < listing.reservePrice) {
                            // Reserve price not met
                            await prisma.listing.update({
                                where: { id: listing.id },
                                data: { status: 'UNSOLD' }
                            });

                            await prisma.bid.updateMany({
                                where: {
                                    listingId: listing.id,
                                    status: 'WINNING'
                                },
                                data: { status: 'OUTBID' }
                            });

                            results.unsold++;
                            results.processed.push({
                                id: listing.id,
                                title: listing.title,
                                status: 'UNSOLD',
                                reason: 'Reserve price not met'
                            });
                        } else {
                            // Auction ended with winner
                            await prisma.listing.update({
                                where: { id: listing.id },
                                data: { status: 'ENDED' }
                            });

                            // Send winner notification
                            await prisma.notification.create({
                                data: {
                                    userId: winningBid.bidderId,
                                    type: 'AUCTION_WON',
                                    message: `Congratulations! You won "${listing.title}" with a bid of $${listing.currentBid.toFixed(2)}`,
                                    link: `/listings/${listing.id}`
                                }
                            });

                            // Send email to winner
                            await emailService.sendAuctionWonEmail(
                                winningBid.bidder.email,
                                winningBid.bidder.name,
                                listing.title,
                                listing.currentBid,
                                listing.id
                            );

                            // Emit socket event
                            socketService.emitToUser(winningBid.bidderId, 'auction:won', {
                                listingId: listing.id,
                                title: listing.title,
                                amount: listing.currentBid
                            });

                            results.sold++;
                            results.processed.push({
                                id: listing.id,
                                title: listing.title,
                                status: 'ENDED',
                                winner: winningBid.bidder.username,
                                amount: listing.currentBid
                            });
                        }
                    } else {
                        // No bids - mark as unsold
                        await prisma.listing.update({
                            where: { id: listing.id },
                            data: { status: 'UNSOLD' }
                        });

                        results.unsold++;
                        results.processed.push({
                            id: listing.id,
                            title: listing.title,
                            status: 'UNSOLD',
                            reason: 'No bids placed'
                        });
                    }
                } catch (error) {
                    console.error(`Error processing listing ${listing.id}:`, error);
                    results.processed.push({
                        id: listing.id,
                        title: listing.title,
                        status: 'ERROR',
                        error: error.message
                    });
                }
            }

            // Start upcoming auctions that should be live
            const upcomingAuctions = await prisma.listing.updateMany({
                where: {
                    status: 'UPCOMING',
                    startTime: {
                        lte: now
                    }
                },
                data: {
                    status: 'LIVE'
                }
            });

            results.started = upcomingAuctions.count;

            console.log('Cron job completed:', results);

            res.json({
                success: true,
                message: 'Auctions processed successfully',
                results
            });
        } catch (error) {
            console.error('Cron job error:', error);
            next(error);
        }
    }

    // Remind users about ending auctions (24 hours before)
    async sendAuctionReminders(req, res, next) {
        try {
            const cronSecret = req.headers['x-cron-secret'];
            if (cronSecret !== process.env.CRON_SECRET) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Find auctions ending in the next 24 hours
            const endingAuctions = await prisma.listing.findMany({
                where: {
                    status: 'LIVE',
                    endTime: {
                        gte: now,
                        lte: tomorrow
                    }
                },
                include: {
                    bids: {
                        where: { status: 'WINNING' },
                        include: {
                            bidder: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });

            const notificationsSent = [];

            for (const listing of endingAuctions) {
                const winningBid = listing.bids[0];

                if (winningBid) {
                    // Notify current highest bidder
                    await prisma.notification.create({
                        data: {
                            userId: winningBid.bidderId,
                            type: 'AUCTION_ENDING_SOON',
                            message: `"${listing.title}" is ending in less than 24 hours. Current bid: $${listing.currentBid.toFixed(2)}`,
                            link: `/listings/${listing.id}`
                        }
                    });

                    socketService.emitToUser(winningBid.bidderId, 'auction:reminder', {
                        listingId: listing.id,
                        title: listing.title,
                        endTime: listing.endTime
                    });

                    notificationsSent.push({
                        listingId: listing.id,
                        userId: winningBid.bidderId
                    });
                }
            }

            res.json({
                success: true,
                message: 'Reminders sent successfully',
                count: notificationsSent.length,
                notifications: notificationsSent
            });
        } catch (error) {
            console.error('Reminder job error:', error);
            next(error);
        }
    }

    // Clean up old notifications
    async cleanupNotifications(req, res, next) {
        try {
            const cronSecret = req.headers['x-cron-secret'];
            if (cronSecret !== process.env.CRON_SECRET) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            // Delete notifications older than 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const result = await prisma.notification.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo
                    },
                    read: true
                }
            });

            res.json({
                success: true,
                message: 'Old notifications cleaned up',
                deleted: result.count
            });
        } catch (error) {
            console.error('Cleanup job error:', error);
            next(error);
        }
    }
}

module.exports = new CronController();
