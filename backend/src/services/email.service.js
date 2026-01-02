const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    }

    async sendEmail({ to, subject, html }) {
        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html
            });

            if (error) {
                console.error('Email error:', error);
                throw new Error(error.message);
            }

            console.log(`Email sent to ${to}:`, data);
            return data;
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    async sendVerificationEmail(to, name, token) {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to GoAuction!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Thank you for registering with GoAuction. Please verify your email address to complete your registration.</p>
                        <p style="text-align: center;">
                            <a href="${verificationLink}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                    <div class="footer">
                        <p>If you didn't create an account, please ignore this email.</p>
                        <p>&copy; ${new Date().getFullYear()} GoAuction. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: 'Verify your email address',
            html
        });
    }

    async sendPasswordResetEmail(to, name, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Reset Your Password</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>You requested to reset your password. Click the button below to set a new password:</p>
                        <p style="text-align: center;">
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
                        <p>This link will expire in 1 hour.</p>
                    </div>
                    <div class="footer">
                        <p>If you didn't request a password reset, please ignore this email.</p>
                        <p>&copy; ${new Date().getFullYear()} GoAuction. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: 'Reset your password',
            html
        });
    }

    async sendBidPlacedEmail(to, name, listingTitle, bidderUsername, bidAmount, listingId) {
        const listingLink = `${process.env.FRONTEND_URL}/listings/${listingId}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 New Bid Placed!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Great news! <strong>${bidderUsername}</strong> just placed a bid on your listing:</p>
                        <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">${listingTitle}</p>
                        <div class="amount">$${bidAmount.toFixed(2)}</div>
                        <p style="text-align: center;">
                            <a href="${listingLink}" class="button">View Listing</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} GoAuction. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: `New bid on "${listingTitle}"`,
            html
        });
    }

    async sendOutbidEmail(to, name, listingTitle, oldBid, newBid, listingId) {
        const listingLink = `${process.env.FRONTEND_URL}/listings/${listingId}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .bids { display: flex; justify-content: space-around; margin: 20px 0; }
                    .bid { text-align: center; }
                    .bid-label { color: #666; font-size: 14px; }
                    .bid-amount { font-size: 20px; font-weight: bold; margin-top: 5px; }
                    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>😟 You've Been Outbid!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Unfortunately, you've been outbid on:</p>
                        <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">${listingTitle}</p>
                        <div class="bids">
                            <div class="bid">
                                <div class="bid-label">Your Bid</div>
                                <div class="bid-amount">$${oldBid.toFixed(2)}</div>
                            </div>
                            <div class="bid">
                                <div class="bid-label">New Bid</div>
                                <div class="bid-amount" style="color: #f5576c;">$${newBid.toFixed(2)}</div>
                            </div>
                        </div>
                        <p style="text-align: center;">
                            <a href="${listingLink}" class="button">Place a Higher Bid</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} GoAuction. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: `You've been outbid on "${listingTitle}"`,
            html
        });
    }

    async sendAuctionWonEmail(to, name, listingTitle, winningBid, listingId) {
        const paymentLink = `${process.env.FRONTEND_URL}/payment?listing=${listingId}`;
        const listingLink = `${process.env.FRONTEND_URL}/listings/${listingId}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount { font-size: 32px; font-weight: bold; color: #11998e; text-align: center; margin: 20px 0; }
                    .button { display: inline-block; background: #11998e; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 16px; }
                    .button:hover { background: #0d7a6f; }
                    .info-box { background: #e6f7f5; border-left: 4px solid #11998e; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .secondary-link { color: #11998e; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎊 Congratulations! You Won!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Congratulations! You won the auction for:</p>
                        <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">${listingTitle}</p>
                        <div class="amount">$${winningBid.toFixed(2)}</div>
                        
                        <div class="info-box">
                            <p style="margin: 0;"><strong>⏰ Payment Required</strong></p>
                            <p style="margin: 5px 0 0 0;">Please complete your payment within 48 hours to secure your purchase.</p>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${paymentLink}" class="button">💳 Pay Now - $${winningBid.toFixed(2)}</a>
                        </p>
                        
                        <p style="text-align: center; font-size: 14px; color: #666;">
                            Or view listing details: <a href="${listingLink}" class="secondary-link">View Listing</a>
                        </p>
                        
                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            <strong>What's next?</strong><br>
                            1. Click "Pay Now" to complete your payment securely via Stripe<br>
                            2. You'll receive a payment confirmation email<br>
                            3. The seller will be notified to ship your item
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} GoAuction. All rights reserved.</p>
                        <p>Need help? Contact us at support@goauction.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: `🎉 Congratulations! You won "${listingTitle}" - Complete Payment`,
            html
        });
    }

    async sendPaymentReceivedEmail(to, name, listingTitle, amount, orderId) {
        const orderLink = `${process.env.FRONTEND_URL}/orders/${orderId}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount { font-size: 28px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Payment Received!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>We've received your payment for:</p>
                        <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">${listingTitle}</p>
                        <div class="amount">$${amount.toFixed(2)}</div>
                        <p>The seller will be in contact with you shortly to arrange delivery or pickup.</p>
                        <p style="text-align: center;">
                            <a href="${orderLink}" class="button">View Order Details</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} GoAuction. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: 'Payment received - Order confirmed',
            html
        });
    }
}

module.exports = new EmailService();
