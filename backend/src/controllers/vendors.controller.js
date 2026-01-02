const prisma = require('../models/prisma');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class VendorsController {
    // Create Stripe Connect account
    async createConnectAccount(req, res, next) {
        try {
            const userId = req.user.id;

            // Check if user already has Stripe account
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { stripeAccountId: true }
            });

            if (user.stripeAccountId) {
                return res.status(400).json({
                    success: false,
                    message: 'Stripe account already exists'
                });
            }

            // Create Stripe Connect account
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                }
            });

            // Update user with Stripe account ID
            await prisma.user.update({
                where: { id: userId },
                data: {
                    stripeAccountId: account.id,
                    isVendor: true
                }
            });

            // Create account link for onboarding
            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${process.env.FRONTEND_URL}/vendor/connect-stripe?refresh=true`,
                return_url: `${process.env.FRONTEND_URL}/vendor/connect-stripe?success=true`,
                type: 'account_onboarding'
            });

            res.json({
                success: true,
                accountId: account.id,
                onboardingUrl: accountLink.url
            });
        } catch (error) {
            next(error);
        }
    }

    // Get Stripe Connect account status
    async getAccountStatus(req, res, next) {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { stripeAccountId: true }
            });

            if (!user.stripeAccountId) {
                return res.json({
                    success: true,
                    connected: false,
                    detailsSubmitted: false,
                    chargesEnabled: false,
                    payoutsEnabled: false
                });
            }

            // Get Stripe account details
            const account = await stripe.accounts.retrieve(user.stripeAccountId);

            res.json({
                success: true,
                connected: true,
                detailsSubmitted: account.details_submitted,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                requirements: account.requirements
            });
        } catch (error) {
            next(error);
        }
    }

    // Create new onboarding link
    async createOnboardingLink(req, res, next) {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { stripeAccountId: true }
            });

            if (!user.stripeAccountId) {
                return res.status(400).json({
                    success: false,
                    message: 'No Stripe account found'
                });
            }

            const accountLink = await stripe.accountLinks.create({
                account: user.stripeAccountId,
                refresh_url: `${process.env.FRONTEND_URL}/vendor/connect-stripe?refresh=true`,
                return_url: `${process.env.FRONTEND_URL}/vendor/connect-stripe?success=true`,
                type: 'account_onboarding'
            });

            res.json({
                success: true,
                url: accountLink.url
            });
        } catch (error) {
            next(error);
        }
    }

    // Create dashboard link
    async createDashboardLink(req, res, next) {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { stripeAccountId: true }
            });

            if (!user.stripeAccountId) {
                return res.status(400).json({
                    success: false,
                    message: 'No Stripe account found'
                });
            }

            const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);

            res.json({
                success: true,
                url: loginLink.url
            });
        } catch (error) {
            next(error);
        }
    }

    // Get vendor earnings
    async getEarnings(req, res, next) {
        try {
            const userId = req.user.id;
            const { period = 'all' } = req.query;

            let startDate;
            const now = new Date();

            switch (period) {
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }

            const earnings = await prisma.payment.aggregate({
                where: {
                    sellerId: userId,
                    status: 'succeeded',
                    paidAt: {
                        gte: startDate
                    }
                },
                _sum: { amount: true },
                _count: true
            });

            const recentSales = await prisma.payment.findMany({
                where: {
                    sellerId: userId,
                    status: 'succeeded'
                },
                include: {
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            images: true
                        }
                    },
                    buyer: {
                        select: {
                            id: true,
                            username: true,
                            name: true
                        }
                    }
                },
                orderBy: { paidAt: 'desc' },
                take: 10
            });

            res.json({
                success: true,
                earnings: {
                    total: earnings._sum.amount || 0,
                    count: earnings._count,
                    period
                },
                recentSales
            });
        } catch (error) {
            next(error);
        }
    }

    // Apply to become vendor
    async applyVendor(req, res, next) {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (user.isVendor) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already a vendor'
                });
            }

            // Update user to vendor
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { isVendor: true }
            });

            res.json({
                success: true,
                message: 'Vendor status activated',
                user: {
                    id: updated.id,
                    isVendor: updated.isVendor
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VendorsController();
