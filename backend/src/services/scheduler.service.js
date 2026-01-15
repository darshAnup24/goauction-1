const cron = require('node-cron');
const prisma = require('../models/prisma');
const emailService = require('./email.service');
const socketService = require('../socket');

class SchedulerService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Start all scheduled jobs
     */
    start() {
        console.log('🕐 Starting auction scheduler...');

        // Run auction status updates every minute
        const auctionStatusJob = cron.schedule('* * * * *', async () => {
            await this.updateAuctionStatuses();
        });

        this.jobs.push(auctionStatusJob);
        console.log('✅ Auction scheduler started - running every minute');
    }

    /**
     * Stop all scheduled jobs
     */
    stop() {
        console.log('🛑 Stopping auction scheduler...');
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        console.log('✅ Auction scheduler stopped');
    }

    /**
     * Update auction statuses (UPCOMING -> LIVE -> ENDED/SOLD/UNSOLD)
     * This is the core logic that runs every minute
     */
    async updateAuctionStatuses() {
        try {
            const now = new Date();
            const results = {
                started: 0,
                ended: 0,
                sold: 0,
                unsold: 0,
                errors: []
            };

            // 1. Start UPCOMING auctions that should be LIVE
            const upcomingToLive = await prisma.listing.updateMany({
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

            results.started = upcomingToLive.count;

            if (upcomingToLive.count > 0) {
                console.log(`🟢 Started ${upcomingToLive.count} auction(s)`);
            }

            // 2. End LIVE auctions that have passed their end time
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

            // Process each ended auction
            for (const listing of endedAuctions) {
                try {
                    const winningBid = listing.bids[0];

                    if (winningBid) {
                        // Auction has a winner
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
                            console.log(`🔴 Auction "${listing.title}" ended UNSOLD (reserve not met)`);
                        } else {
                            // Auction ended with winner - set to ENDED (not SOLD yet, SOLD is after payment)
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
                            try {
                                await emailService.sendAuctionWonEmail(
                                    winningBid.bidder.email,
                                    winningBid.bidder.name,
                                    listing.title,
                                    listing.currentBid,
                                    listing.id
                                );
                            } catch (emailError) {
                                console.error('Error sending winner email:', emailError);
                            }

                            // Emit socket event
                            socketService.emitToUser(winningBid.bidderId, 'auction:won', {
                                listingId: listing.id,
                                title: listing.title,
                                amount: listing.currentBid
                            });

                            results.ended++;
                            console.log(`🎉 Auction "${listing.title}" ended - Winner: ${winningBid.bidder.username} ($${listing.currentBid.toFixed(2)})`);
                        }
                    } else {
                        // No bids - mark as unsold
                        await prisma.listing.update({
                            where: { id: listing.id },
                            data: { status: 'UNSOLD' }
                        });

                        results.unsold++;
                        console.log(`🔴 Auction "${listing.title}" ended UNSOLD (no bids)`);
                    }
                } catch (error) {
                    console.error(`Error processing listing ${listing.id}:`, error);
                    results.errors.push({
                        listingId: listing.id,
                        error: error.message
                    });
                }
            }

            // Log summary if any changes were made
            if (results.started > 0 || results.ended > 0 || results.unsold > 0) {
                console.log('📊 Auction status update summary:', {
                    started: results.started,
                    ended: results.ended,
                    unsold: results.unsold,
                    errors: results.errors.length
                });
            }

            return results;
        } catch (error) {
            console.error('❌ Error in auction status update:', error);
            throw error;
        }
    }
}

module.exports = new SchedulerService();
