const Stripe = require('stripe');

class StripeService {
    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('⚠️  STRIPE_SECRET_KEY not configured');
            this.stripe = null;
            return;
        }

        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-11-20.acacia'
        });
        
        this.platformFeePercentage = 0.05; // 5% platform fee
    }

    /**
     * Calculate platform fee (5% of transaction)
     */
    calculatePlatformFee(amount) {
        return Math.round(amount * this.platformFeePercentage * 100) / 100;
    }

    /**
     * Calculate seller payout after platform fee
     */
    calculateSellerPayout(amount) {
        const platformFee = this.calculatePlatformFee(amount);
        return amount - platformFee;
    }

    /**
     * Format amount for Stripe (convert to cents)
     */
    formatAmountForStripe(amount) {
        return Math.round(amount * 100);
    }

    /**
     * Format amount from Stripe (convert from cents)
     */
    formatAmountFromStripe(amount) {
        return amount / 100;
    }

    /**
     * Create a payment intent
     */
    async createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: this.formatAmountForStripe(amount),
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return paymentIntent;
        } catch (error) {
            console.error('Stripe payment intent error:', error);
            throw error;
        }
    }

    /**
     * Create a checkout session for auction payment
     */
    async createCheckoutSession({
        listingId,
        listingTitle,
        amount,
        buyerId,
        sellerId,
        successUrl,
        cancelUrl
    }) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: listingTitle,
                                description: `Auction payment for: ${listingTitle}`
                            },
                            unit_amount: this.formatAmountForStripe(amount)
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    listingId,
                    buyerId,
                    sellerId,
                    amount: amount.toString()
                }
            });

            return session;
        } catch (error) {
            console.error('Stripe checkout session error:', error);
            throw error;
        }
    }

    /**
     * Create Stripe Connect account for seller
     */
    async createConnectAccount({ email, country = 'US' }) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const account = await this.stripe.accounts.create({
                type: 'express',
                email,
                country,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                }
            });

            return account;
        } catch (error) {
            console.error('Stripe Connect account creation error:', error);
            throw error;
        }
    }

    /**
     * Create account link for onboarding
     */
    async createAccountLink({ accountId, refreshUrl, returnUrl }) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: refreshUrl,
                return_url: returnUrl,
                type: 'account_onboarding'
            });

            return accountLink;
        } catch (error) {
            console.error('Stripe account link error:', error);
            throw error;
        }
    }

    /**
     * Transfer funds to seller's Stripe Connect account
     */
    async transferToSeller({ amount, sellerId, stripeAccountId, listingId }) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const platformFee = this.calculatePlatformFee(amount);
            const sellerPayout = this.calculateSellerPayout(amount);

            const transfer = await this.stripe.transfers.create({
                amount: this.formatAmountForStripe(sellerPayout),
                currency: 'usd',
                destination: stripeAccountId,
                metadata: {
                    sellerId,
                    listingId,
                    platformFee: platformFee.toString(),
                    sellerPayout: sellerPayout.toString()
                }
            });

            return transfer;
        } catch (error) {
            console.error('Stripe transfer error:', error);
            throw error;
        }
    }

    /**
     * Retrieve account information
     */
    async getAccountInfo(accountId) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const account = await this.stripe.accounts.retrieve(accountId);
            return account;
        } catch (error) {
            console.error('Stripe account retrieval error:', error);
            throw error;
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature, secret) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                secret
            );
            return event;
        } catch (error) {
            console.error('Webhook signature verification error:', error);
            throw error;
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(paymentIntentId, amount = null) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? this.formatAmountForStripe(amount) : undefined
            });

            return refund;
        } catch (error) {
            console.error('Stripe refund error:', error);
            throw error;
        }
    }
}

module.exports = new StripeService();
