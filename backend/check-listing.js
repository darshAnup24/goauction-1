const prisma = require('./src/models/prisma');

async function checkListing() {
    try {
        const listing = await prisma.listing.findFirst({
            where: {
                title: {
                    contains: 'laptop4',
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                title: true,
                status: true,
                startTime: true,
                endTime: true,
                currentBid: true,
                bidCount: true,
                createdAt: true
            }
        });

        console.log('Listing found:', JSON.stringify(listing, null, 2));
        console.log('\nCurrent time:', new Date());
        console.log('Start time:', listing?.startTime);
        console.log('End time:', listing?.endTime);
        console.log('Start time passed?', listing?.startTime && new Date(listing.startTime) <= new Date());
        console.log('End time passed?', listing?.endTime && new Date(listing.endTime) <= new Date());
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkListing();
