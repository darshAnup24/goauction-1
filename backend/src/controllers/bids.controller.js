const prisma = require('../models/prisma');
const socketService = require('../socket');
const emailService = require('../services/email.service');

const MINIMUM_BID_INCREMENT = 1.00;

class BidsController {
    // Place a bid
    async placeBid(req, res, next) {
        try {
            const { listingId, amount } = req.body;
            const userId = req.user.id;

            // Validate required fields
            if (!listingId) {
                return res.status(400).json({
                    success: false,
                    error: 'Listing ID is required'
                });
            }

            if (!amount || typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid bid amount is required'
                });
            }

            // Use Prisma transaction with row locking
            const result = await prisma.$transaction(async (tx) => {
                // 1. Fetch listing with row-level lock
                const listing = await tx.$queryRaw`
                    SELECT * FROM "Listing" 
                    WHERE id = ${listingId} 
                    FOR UPDATE
                `;

                if (!listing || listing.length === 0) {
                    throw new Error('Listing not found');
                }

                const lockedListing = listing[0];

                // 2. Validate user is not the seller
                if (lockedListing.sellerId === userId) {
                    throw new Error('You cannot bid on your own listing');
                }

                // 3. Validate auction status and timing
                const now = new Date();
                const startTime = new Date(lockedListing.startTime);
                const endTime = new Date(lockedListing.endTime);

                if (startTime > now) {
                    throw new Error('This auction has not started yet');
                }

                if (endTime <= now) {
                    throw new Error('This auction has already ended');
                }

                if (lockedListing.status !== 'LIVE') {
                    throw new Error(`Cannot bid on ${lockedListing.status.toLowerCase()} auctions`);
                }

                // 4. Calculate minimum required bid
                const currentHighestBid = lockedListing.currentBid || lockedListing.startingPrice;
                const minimumBid = currentHighestBid + MINIMUM_BID_INCREMENT;

                // 5. Validate bid amount
                if (amount < minimumBid) {
                    throw new Error(
                        `Bid must be at least $${minimumBid.toFixed(2)} (current bid + $${MINIMUM_BID_INCREMENT.toFixed(2)} minimum increment)`
                    );
                }

                // Check if user already has the highest bid
                const userHighestBid = await tx.bid.findFirst({
                    where: {
                        listingId,
                        bidderId: userId,
                        status: 'WINNING'
                    }
                });

                if (userHighestBid) {
                    throw new Error('You already have the highest bid on this listing');
                }

                // 6. Mark all previous bids as OUTBID
                await tx.bid.updateMany({
                    where: {
                        listingId,
                        status: 'WINNING'
                    },
                    data: {
                        status: 'OUTBID'
                    }
                });

                // Get previous highest bidder for notification
                const previousWinningBid = await tx.bid.findFirst({
                    where: {
                        listingId,
                        status: 'OUTBID'
                    },
                    orderBy: {
                        amount: 'desc'
                    },
                    include: {
                        bidder: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                });

                // 7. Create new bid with WINNING status
                const newBid = await tx.bid.create({
                    data: {
                        amount,
                        bidderId: userId,
                        listingId,
                        status: 'WINNING'
                    },
                    include: {
                        bidder: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                image: true
                            }
                        },
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                images: true,
                                endTime: true,
                                sellerId: true
                            }
                        }
                    }
                });

                // 8. Update listing's current bid and bid count
                const updatedListing = await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        currentBid: amount,
                        bidCount: {
                            increment: 1
                        }
                    },
                    include: {
                        seller: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                name: true
                            }
                        },
                        bids: {
                            take: 5,
                            orderBy: {
                                amount: 'desc'
                            },
                            include: {
                                bidder: {
                                    select: {
                                        id: true,
                                        username: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    }
                });

                // 9. Create notifications
                const notifications = [];

                // Notify previous highest bidder
                if (previousWinningBid && previousWinningBid.bidder.id !== userId) {
                    notifications.push(
                        tx.notification.create({
                            data: {
                                userId: previousWinningBid.bidder.id,
                                type: 'BID_OUTBID',
                                message: `You have been outbid on "${updatedListing.title}". New bid: $${amount.toFixed(2)}`,
                                link: `/listings/${listingId}`
                            }
                        })
                    );
                }

                // Notify seller
                if (updatedListing.seller.id !== userId) {
                    notifications.push(
                        tx.notification.create({
                            data: {
                                userId: updatedListing.seller.id,
                                type: 'BID_PLACED',
                                message: `New bid of $${amount.toFixed(2)} placed on "${updatedListing.title}" by ${newBid.bidder.username}`,
                                link: `/listings/${listingId}`
                            }
                        })
                    );
                }

                await Promise.all(notifications);

                return {
                    bid: newBid,
                    listing: updatedListing,
                    previousHighestBid: previousWinningBid?.amount || null,
                    previousWinningBid
                };
            }, {
                maxWait: 5000,
                timeout: 10000,
                isolationLevel: 'Serializable'
            });

            // Emit real-time event
            socketService.emitToAuction(listingId, 'bid:new', {
                bid: {
                    id: result.bid.id,
                    amount: result.bid.amount,
                    status: result.bid.status,
                    createdAt: result.bid.createdAt,
                    bidder: result.bid.bidder
                },
                listing: {
                    id: result.listing.id,
                    title: result.listing.title,
                    currentBid: result.listing.currentBid,
                    bidCount: result.listing.bidCount,
                    endTime: result.listing.endTime
                },
                previousHighestBid: result.previousHighestBid,
                timestamp: new Date().toISOString()
            });

            // Send email notifications (async, don't wait)
            if (result.previousWinningBid) {
                emailService.sendOutbidEmail(
                    result.previousWinningBid.bidder.email,
                    result.previousWinningBid.bidder.name,
                    result.listing.title,
                    result.previousHighestBid,
                    result.bid.amount,
                    listingId
                ).catch(err => console.error('Error sending outbid email:', err));
            }

            emailService.sendBidPlacedEmail(
                result.listing.seller.email,
                result.listing.seller.name,
                result.listing.title,
                result.bid.bidder.username,
                result.bid.amount,
                listingId
            ).catch(err => console.error('Error sending bid placed email:', err));

            res.status(201).json({
                success: true,
                message: 'Bid placed successfully',
                bid: {
                    id: result.bid.id,
                    amount: result.bid.amount,
                    status: result.bid.status,
                    createdAt: result.bid.createdAt,
                    bidder: result.bid.bidder
                },
                listing: {
                    id: result.listing.id,
                    title: result.listing.title,
                    currentBid: result.listing.currentBid,
                    bidCount: result.listing.bidCount,
                    endTime: result.listing.endTime,
                    recentBids: result.listing.bids
                },
                previousHighestBid: result.previousHighestBid
            });
        } catch (error) {
            console.error('Bid placement error:', error.message);
            console.error('Error details:', error);
            
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes('cannot bid') ||
                error.message.includes('not started') ||
                error.message.includes('already ended') ||
                error.message.includes('Bid must be at least') ||
                error.message.includes('already have the highest bid')
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            if (error.code === 'P2028' || error.message.includes('timeout')) {
                return res.status(408).json({
                    success: false,
                    message: 'Bid placement timed out. Please try again.'
                });
            }

            next(error);
        }
    }

    // Get bids for a listing
    async getListingBids(req, res, next) {
        try {
            const { listingId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [bids, total] = await Promise.all([
                prisma.bid.findMany({
                    where: { listingId },
                    include: {
                        bidder: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                image: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.bid.count({ where: { listingId } })
            ]);

            // Get listing data to include current bid info
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                select: {
                    id: true,
                    currentBid: true,
                    bidCount: true,
                    startingPrice: true
                }
            });

            res.json({
                success: true,
                bids,
                listing,
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

    // Get user's bids
    async getMyBids(req, res, next) {
        try {
            const userId = req.user.id;
            const { status, page = 1, limit = 20 } = req.query;

            const where = { bidderId: userId };
            if (status) {
                where.status = status.toUpperCase();
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [bids, total] = await Promise.all([
                prisma.bid.findMany({
                    where,
                    include: {
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                images: true,
                                currentBid: true,
                                status: true,
                                endTime: true,
                                startingPrice: true,
                                payments: {
                                    select: {
                                        id: true,
                                        status: true,
                                        amount: true,
                                        paidAt: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.bid.count({ where })
            ]);

            res.json({
                success: true,
                bids,
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

    // Get bid statistics for a listing
    async getBidStats(req, res, next) {
        try {
            const { listingId } = req.params;

            const stats = await prisma.bid.aggregate({
                where: { listingId },
                _count: true,
                _max: {
                    amount: true
                },
                _min: {
                    amount: true
                },
                _avg: {
                    amount: true
                }
            });

            const uniqueBidders = await prisma.bid.findMany({
                where: { listingId },
                select: { bidderId: true },
                distinct: ['bidderId']
            });

            res.json({
                success: true,
                stats: {
                    totalBids: stats._count,
                    highestBid: stats._max.amount,
                    lowestBid: stats._min.amount,
                    averageBid: stats._avg.amount,
                    uniqueBidders: uniqueBidders.length
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BidsController();
