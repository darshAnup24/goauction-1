// Quick script to send winner email
require('dotenv').config();
const emailService = require('./src/services/email.service');
const prisma = require('./src/models/prisma');

async function sendWinnerEmail() {
    try {
        const listingId = 'cmjtnhabm0001ijd9iuqsfer4';
        
        // Get listing and winner info
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                bids: {
                    where: { status: 'WINNING' },
                    include: {
                        bidder: true
                    }
                }
            }
        });

        if (!listing || !listing.bids[0]) {
            console.log('No winner found');
            return;
        }

        const winner = listing.bids[0].bidder;
        
        console.log('Sending email to:', winner.email);
        console.log('Winner:', winner.name);
        console.log('Listing:', listing.title);
        console.log('Amount: $', listing.currentBid);

        await emailService.sendAuctionWonEmail(
            winner.email,
            winner.name,
            listing.title,
            listing.currentBid,
            listing.id
        );

        console.log('✅ Email sent successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

sendWinnerEmail();
