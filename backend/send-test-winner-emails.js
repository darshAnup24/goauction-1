// Script to send winner emails to test user for all their winning auctions
require('dotenv').config();
const emailService = require('./src/services/email.service');
const prisma = require('./src/models/prisma');

async function sendTestWinnerEmails() {
    try {
        console.log('🔍 Finding test user winning auctions...\n');
        
        // Find the test user
        const testUser = await prisma.user.findUnique({
            where: { email: 'chavandarshan24@gmail.com' }
        });

        if (!testUser) {
            console.log('❌ Test user not found');
            return;
        }

        console.log(`✅ Found test user: ${testUser.name} (${testUser.email})\n`);

        // Get all ended auctions where test user has winning bid
        const winningBids = await prisma.bid.findMany({
            where: {
                bidderId: testUser.id,
                status: 'WINNING',
                listing: {
                    status: 'ENDED'
                }
            },
            include: {
                listing: {
                    include: {
                        seller: true
                    }
                }
            }
        });

        console.log(`📧 Found ${winningBids.length} winning auctions to send emails for:\n`);

        for (const bid of winningBids) {
            const listing = bid.listing;
            
            console.log(`📨 Sending email for: "${listing.title}"`);
            console.log(`   - Amount: $${bid.amount.toFixed(2)}`);
            console.log(`   - Seller: ${listing.seller.name}`);
            
            try {
                await emailService.sendAuctionWonEmail(
                    testUser.email,
                    testUser.name,
                    listing.title,
                    bid.amount,
                    listing.id
                );
                console.log(`   ✅ Email sent successfully!\n`);
            } catch (emailError) {
                console.log(`   ❌ Failed to send email: ${emailError.message}\n`);
            }
        }

        console.log('✅ All winner emails sent!\n');
        console.log('📊 Summary:');
        console.log(`   - User: ${testUser.email}`);
        console.log(`   - Winning auctions: ${winningBids.length}`);
        const totalAmount = winningBids.reduce((sum, bid) => sum + bid.amount, 0);
        console.log(`   - Total amount to pay: $${totalAmount.toFixed(2)}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

sendTestWinnerEmails();
