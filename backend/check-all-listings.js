const prisma = require('./src/models/prisma');

async function checkAllListings() {
    try {
        const listings = await prisma.listing.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                startTime: true,
                endTime: true,
                currentBid: true,
                bidCount: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        console.log('Recent listings:');
        console.log('================');
        listings.forEach(listing => {
            const now = new Date();
            const endTime = new Date(listing.endTime);
            const startTime = new Date(listing.startTime);
            
            console.log(`\nID: ${listing.id}`);
            console.log(`Title: ${listing.title}`);
            console.log(`Status: ${listing.status}`);
            console.log(`Start: ${listing.startTime.toISOString()}`);
            console.log(`End: ${listing.endTime.toISOString()}`);
            console.log(`Start passed? ${startTime <= now}`);
            console.log(`End passed? ${endTime <= now}`);
            console.log(`Current Bid: $${listing.currentBid}`);
            console.log(`Bid Count: ${listing.bidCount}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAllListings();
