const prisma = require('../models/prisma');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('../services/email.service');
const socketService = require('../socket');

class PaymentsController {
    // Create payment intent for winning bid
    async createPaymentIntent(req, res, next) {
        try {
            const { listingId } = req.body;
            const userId = req.user.id;

            // Find the listing and verify user won
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    bids: {
                        where: { 
                            status: { in: ['WINNING', 'WON'] }
                        },
                        include: {
                            bidder: true
                        }
                    },
                    seller: {
                        select: {
                            stripeAccountId: true
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

            if (listing.status !== 'ENDED' && listing.status !== 'SOLD') {
                return res.status(400).json({
                    success: false,
                    message: 'Auction is still ongoing'
                });
            }

            // Check if user won - either by winnerId or by having a winning/won bid
            const winningBid = listing.bids.find(bid => bid.bidderId === userId);
            const isWinner = listing.winnerId === userId || winningBid;

            if (!isWinner) {
                return res.status(403).json({
                    success: false,
                    message: 'You did not win this auction'
                });
            }

            // Check if payment already exists
            const existingPayment = await prisma.payment.findFirst({
                where: {
                    listingId,
                    buyerId: userId
                }
            });

            if (existingPayment && existingPayment.status === 'succeeded') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already completed for this listing'
                });
            }

            // Calculate application fee (10% platform fee)
            const platformFee = Math.round(listing.currentBid * 0.10 * 100); // in cents

            // Create Stripe payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(listing.currentBid * 100), // in cents
                currency: 'usd',
                application_fee_amount: platformFee,
                transfer_data: {
                    destination: listing.seller.stripeAccountId
                },
                metadata: {
                    listingId: listing.id,
                    listingTitle: listing.title,
                    buyerId: userId,
                    sellerId: listing.sellerId
                }
            });

            // Create payment record
            const payment = await prisma.payment.create({
                data: {
                    amount: listing.currentBid,
                    currency: 'USD',
                    status: 'pending',
                    stripePaymentIntentId: paymentIntent.id,
                    buyerId: userId,
                    sellerId: listing.sellerId,
                    listingId: listing.id
                }
            });

            res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentId: payment.id
            });
        } catch (error) {
            next(error);
        }
    }

    // Stripe webhook handler
    async handleWebhook(req, res, next) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        try {
            const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);

            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutSuccess(event.data.object);
                    break;
                
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(400).json({
                success: false,
                message: `Webhook Error: ${error.message}`
            });
        }
    }

    async handleCheckoutSuccess(session) {
        try {
            const { listingId, buyerId, sellerId } = session.metadata;

            // Find payment record by session ID
            const payment = await prisma.payment.findFirst({
                where: { stripePaymentIntentId: session.id },
                include: {
                    buyer: true,
                    seller: true,
                    listing: true
                }
            });

            if (!payment) {
                console.error('Payment not found for session:', session.id);
                return;
            }

            // Update payment record
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'succeeded',
                    paidAt: new Date()
                }
            });

            // Update listing status to SOLD
            await prisma.listing.update({
                where: { id: listingId },
                data: { status: 'SOLD' }
            });

            // Update winning bid status
            await prisma.bid.updateMany({
                where: {
                    listingId: listingId,
                    status: 'WINNING'
                },
                data: { status: 'WON' }
            });

            // Create notification for seller
            await prisma.notification.create({
                data: {
                    userId: sellerId,
                    type: 'PAYMENT_RECEIVED',
                    title: 'Payment Received',
                    message: `Payment of $${payment.amount.toFixed(2)} received for "${payment.listing.title}"`,
                    relatedListingId: listingId
                }
            });

            // Send payment confirmation email to buyer
            await emailService.sendPaymentReceivedEmail(
                payment.buyer.email,
                payment.buyer.name,
                payment.listing.title,
                payment.amount,
                payment.id
            );

            // Send payment notification email to seller
            await emailService.sendEmail(
                payment.seller.email,
                'Payment Received - GoAuction',
                `<h2>Payment Received!</h2>
                <p>Great news! Payment of $${payment.amount.toFixed(2)} has been received for your auction "${payment.listing.title}".</p>
                <p>Buyer: ${payment.buyer.name} (${payment.buyer.email})</p>
                <p>Please prepare the item for delivery.</p>`
            );

            // Emit socket events
            socketService.emitToUser(buyerId, 'payment:success', {
                paymentId: payment.id,
                listingId: listingId
            });

            socketService.emitToUser(sellerId, 'payment:received', {
                paymentId: payment.id,
                listingId: listingId,
                amount: payment.amount
            });

            console.log(`Payment successful: ${payment.id}`);
        } catch (error) {
            console.error('Error handling checkout success:', error);
        }
    }

    async handlePaymentSuccess(paymentIntent) {
        try {
            const payment = await prisma.payment.update({
                where: { stripePaymentIntentId: paymentIntent.id },
                data: {
                    status: 'succeeded',
                    paidAt: new Date()
                },
                include: {
                    buyer: true,
                    seller: true,
                    listing: true
                }
            });

            // Update listing status to SOLD
            await prisma.listing.update({
                where: { id: payment.listingId },
                data: { status: 'SOLD' }
            });

            // Update winning bid status
            await prisma.bid.updateMany({
                where: {
                    listingId: payment.listingId,
                    status: 'WINNING'
                },
                data: { status: 'WON' }
            });

            // Create notification for seller
            await prisma.notification.create({
                data: {
                    userId: payment.sellerId,
                    type: 'PAYMENT_RECEIVED',
                    title: 'Payment Received',
                    message: `Payment of $${payment.amount.toFixed(2)} received for "${payment.listing.title}"`,
                    relatedListingId: payment.listingId
                }
            });

            // Send emails
            await emailService.sendPaymentReceivedEmail(
                payment.buyer.email,
                payment.buyer.name,
                payment.listing.title,
                payment.amount,
                payment.id
            );

            // Send email to seller
            await emailService.sendEmail(
                payment.seller.email,
                'Payment Received - GoAuction',
                `<h2>Payment Received!</h2>
                <p>Great news! Payment of $${payment.amount.toFixed(2)} has been received for your auction "${payment.listing.title}".</p>
                <p>Buyer: ${payment.buyer.name} (${payment.buyer.email})</p>
                <p>Please prepare the item for delivery.</p>`
            );

            // Emit socket events
            socketService.emitToUser(payment.buyerId, 'payment:success', {
                paymentId: payment.id,
                listingId: payment.listingId
            });

            socketService.emitToUser(payment.sellerId, 'payment:received', {
                paymentId: payment.id,
                listingId: payment.listingId,
                amount: payment.amount
            });

            console.log(`Payment successful: ${payment.id}`);
        } catch (error) {
            console.error('Error handling payment success:', error);
        }
    }

    async handlePaymentFailed(paymentIntent) {
        try {
            await prisma.payment.update({
                where: { stripePaymentIntentId: paymentIntent.id },
                data: { status: 'failed' }
            });

            console.log(`Payment failed: ${paymentIntent.id}`);
        } catch (error) {
            console.error('Error handling payment failure:', error);
        }
    }

    // Get payment details
    async getPayment(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const payment = await prisma.payment.findUnique({
                where: { id },
                include: {
                    listing: true,
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
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

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Check if user is buyer or seller
            if (payment.buyerId !== userId && payment.sellerId !== userId && req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                payment
            });
        } catch (error) {
            next(error);
        }
    }

    // Get user's payments
    async getMyPayments(req, res, next) {
        try {
            const userId = req.user.id;
            const { type = 'purchases', page = 1, limit = 10 } = req.query;

            const where = type === 'purchases' 
                ? { buyerId: userId }
                : { sellerId: userId };

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [paymentsRaw, total] = await Promise.all([
                prisma.payment.findMany({
                    where,
                    include: {
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                images: {
                                    select: {
                                        imageUrl: true
                                    }
                                }
                            }
                        },
                        buyer: {
                            select: {
                                id: true,
                                name: true,
                                username: true
                            }
                        },
                        seller: {
                            select: {
                                id: true,
                                name: true,
                                username: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.payment.count({ where })
            ]);

            const payments = paymentsRaw.map((payment) => ({
                ...payment,
                listing: payment.listing
                    ? {
                        ...payment.listing,
                        images: payment.listing.images.map((img) => img.imageUrl)
                    }
                    : null
            }));

            res.json({
                success: true,
                payments,
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

    // Create Stripe Checkout Session
    async createCheckoutSession(req, res, next) {
        try {
            const { listingId } = req.body;
            const userId = req.user.id;

            // Find the listing and verify user won
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    bids: {
                        where: { 
                            status: { in: ['WINNING', 'WON'] }
                        },
                        include: {
                            bidder: true
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            username: true,
                            stripeAccountId: true
                        }
                    },
                    images: {
                        select: {
                            imageUrl: true
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

            // Check if auction has ended
            const hasEnded = listing.status === 'ENDED' || new Date(listing.endTime) < new Date();
            if (!hasEnded) {
                return res.status(400).json({
                    success: false,
                    message: 'Auction is still ongoing'
                });
            }

            // Check if user won - either by winnerId or by having a winning/won bid
            const winningBid = listing.bids.find(bid => bid.bidderId === userId);
            const isWinner = listing.winnerId === userId || winningBid;

            if (!isWinner) {
                return res.status(403).json({
                    success: false,
                    message: 'You did not win this auction'
                });
            }

            // Check if payment already exists
            const existingPayment = await prisma.payment.findFirst({
                where: {
                    listingId,
                    buyerId: userId,
                    status: 'succeeded'
                }
            });

            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already completed for this listing'
                });
            }

            // Calculate platform fee (5%)
            const platformFee = Math.round(listing.currentBid * 0.05 * 100); // in cents
            const totalAmount = Math.round(listing.currentBid * 100) + platformFee;

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: listing.title,
                                description: `Winning bid for auction`,
                                images: listing.images.map((img) => img.imageUrl).slice(0, 1)
                            },
                            unit_amount: Math.round(listing.currentBid * 100)
                        },
                        quantity: 1
                    },
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Platform Fee (5%)',
                                description: 'GoAuction service fee'
                            },
                            unit_amount: platformFee
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&listing=${listingId}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment?listing=${listingId}`,
                metadata: {
                    listingId: listing.id,
                    listingTitle: listing.title,
                    buyerId: userId,
                    sellerId: listing.sellerId
                }
            });

            // Create payment record
            await prisma.payment.create({
                data: {
                    amount: listing.currentBid,
                    currency: 'USD',
                    status: 'pending',
                    stripePaymentIntentId: session.id,
                    buyerId: userId,
                    sellerId: listing.sellerId,
                    listingId: listing.id
                }
            });

            res.json({
                success: true,
                sessionId: session.id,
                url: session.url
            });
        } catch (error) {
            console.error('Checkout session error:', error);
            next(error);
        }
    }

    // Manual payment completion (for testing when webhooks don't trigger)
    async completePayment(req, res, next) {
        try {
            const { sessionId } = req.body;
            const userId = req.user.id;

            // Find payment by session ID
            const payment = await prisma.payment.findFirst({
                where: {
                    stripePaymentIntentId: sessionId,
                    buyerId: userId
                },
                include: {
                    buyer: true,
                    seller: true,
                    listing: true
                }
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            if (payment.status === 'succeeded') {
                return res.json({
                    success: true,
                    message: 'Payment already completed',
                    payment
                });
            }

            // Update payment status
            const updatedPayment = await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'succeeded',
                    paidAt: new Date()
                }
            });

            // Update listing status to SOLD
            await prisma.listing.update({
                where: { id: payment.listingId },
                data: { status: 'SOLD' }
            });

            // Update winning bid status
            await prisma.bid.updateMany({
                where: {
                    listingId: payment.listingId,
                    status: 'WINNING'
                },
                data: { status: 'WON' }
            });

            // Create notification for seller
            await prisma.notification.create({
                data: {
                    userId: payment.sellerId,
                    type: 'PAYMENT_RECEIVED',
                    message: `Payment of $${payment.amount.toFixed(2)} received for "${payment.listing.title}"`,
                    link: `/listings/${payment.listingId}`,
                    read: false
                }
            });

            // Send emails
            await emailService.sendPaymentReceivedEmail(
                payment.buyer.email,
                payment.buyer.name,
                payment.listing.title,
                payment.amount,
                payment.id
            );

            // Emit socket events
            socketService.emitToUser(payment.buyerId, 'payment:success', {
                paymentId: payment.id,
                listingId: payment.listingId
            });

            socketService.emitToUser(payment.sellerId, 'payment:received', {
                paymentId: payment.id,
                listingId: payment.listingId,
                amount: payment.amount
            });

            res.json({
                success: true,
                message: 'Payment completed successfully',
                payment: updatedPayment
            });
        } catch (error) {
            console.error('Payment completion error:', error);
            next(error);
        }
    }
}

module.exports = new PaymentsController();
