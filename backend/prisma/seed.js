const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    console.log('👥 Creating users...');
    const users = await Promise.all([
        prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: hashedPassword,
                role: 'BUYER',
                emailVerified: new Date(),
                phone: '+1234567890',
                address: '123 Main St, New York, NY 10001'
            }
        }),
        prisma.user.create({
            data: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                username: 'janesmith',
                password: hashedPassword,
                role: 'SELLER',
                isVendor: true,
                emailVerified: new Date(),
                phone: '+1234567891',
                address: '456 Oak Ave, Los Angeles, CA 90001',
                rating: 4.8,
                totalRatings: 25
            }
        }),
        prisma.user.create({
            data: {
                name: 'Mike Johnson',
                email: 'mike@example.com',
                username: 'mikej',
                password: hashedPassword,
                role: 'VENDOR',
                isVendor: true,
                emailVerified: new Date(),
                phone: '+1234567892',
                address: '789 Pine Rd, Chicago, IL 60601',
                rating: 4.5,
                totalRatings: 18
            }
        }),
        prisma.user.create({
            data: {
                name: 'Sarah Williams',
                email: 'sarah@example.com',
                username: 'sarahw',
                password: hashedPassword,
                role: 'BUYER',
                emailVerified: new Date(),
                phone: '+1234567893',
                address: '321 Elm St, Houston, TX 77001'
            }
        }),
        prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@example.com',
                username: 'admin',
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date()
            }
        })
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    const [john, jane, mike, sarah, admin] = users;

    // Create listings
    console.log('📦 Creating listings...');
    const now = new Date();
    
    const listings = await Promise.all([
        // Live auctions
        prisma.listing.create({
            data: {
                title: 'Vintage Rolex Submariner Watch',
                description: 'Authentic 1960s Rolex Submariner in excellent condition. Recently serviced with original papers.',
                images: [
                    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
                    'https://images.unsplash.com/photo-1587836374228-4c9c37c1e1c1'
                ],
                category: 'Watches',
                startingPrice: 5000,
                reservePrice: 8000,
                currentBid: 5500,
                startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
                endTime: new Date(now.getTime() + 22 * 60 * 60 * 1000), // Ends in 22 hours
                duration: 24,
                status: 'LIVE',
                sellerId: jane.id,
                bidCount: 3,
                viewCount: 45
            }
        }),
        prisma.listing.create({
            data: {
                title: 'MacBook Pro 16" M3 Max',
                description: 'Brand new sealed MacBook Pro with M3 Max chip, 64GB RAM, 2TB SSD. Space Black.',
                images: [
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
                    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9'
                ],
                category: 'Electronics',
                startingPrice: 2500,
                currentBid: 2800,
                startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 19 * 60 * 60 * 1000),
                duration: 24,
                status: 'LIVE',
                sellerId: mike.id,
                bidCount: 5,
                viewCount: 78
            }
        }),
        prisma.listing.create({
            data: {
                title: 'Antique Persian Rug',
                description: 'Beautiful hand-woven Persian rug from the 1920s. 8x10 feet, excellent condition.',
                images: [
                    'https://images.unsplash.com/photo-1600166898405-da9535204843'
                ],
                category: 'Home & Garden',
                startingPrice: 1200,
                reservePrice: 1800,
                currentBid: 1400,
                startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 47 * 60 * 60 * 1000),
                duration: 48,
                status: 'LIVE',
                sellerId: jane.id,
                bidCount: 2,
                viewCount: 32
            }
        }),
        
        // Upcoming auctions
        prisma.listing.create({
            data: {
                title: 'Sony A7 IV Camera with 24-70mm Lens',
                description: 'Professional mirrorless camera, lightly used with less than 5000 shutter count.',
                images: [
                    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'
                ],
                category: 'Electronics',
                startingPrice: 1800,
                reservePrice: 2200,
                currentBid: 1800,
                startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Starts in 2 hours
                endTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
                duration: 24,
                status: 'UPCOMING',
                sellerId: mike.id,
                viewCount: 15
            }
        }),
        prisma.listing.create({
            data: {
                title: 'Nike Air Jordan 1 Retro High OG',
                description: 'Limited edition sneakers, size 10, brand new in box with original receipt.',
                images: [
                    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2'
                ],
                category: 'Fashion',
                startingPrice: 300,
                currentBid: 300,
                startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 28 * 60 * 60 * 1000),
                duration: 24,
                status: 'UPCOMING',
                sellerId: jane.id,
                viewCount: 28
            }
        }),

        // Ending soon
        prisma.listing.create({
            data: {
                title: 'Gaming PC - RTX 4090, i9-13900K',
                description: 'High-end gaming PC built 6 months ago. RTX 4090, Intel i9-13900K, 64GB RAM, 2TB NVMe.',
                images: [
                    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c'
                ],
                category: 'Electronics',
                startingPrice: 2000,
                currentBid: 2600,
                startTime: new Date(now.getTime() - 22 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Ends in 2 hours
                duration: 24,
                status: 'LIVE',
                sellerId: mike.id,
                bidCount: 8,
                viewCount: 120
            }
        }),

        // More listings
        prisma.listing.create({
            data: {
                title: 'Fender Stratocaster Electric Guitar',
                description: 'Classic Sunburst Fender Stratocaster, American made, with hard case.',
                images: [
                    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1'
                ],
                category: 'Musical Instruments',
                startingPrice: 800,
                currentBid: 950,
                startTime: new Date(now.getTime() - 10 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 14 * 60 * 60 * 1000),
                duration: 24,
                status: 'LIVE',
                sellerId: jane.id,
                bidCount: 4,
                viewCount: 56
            }
        }),
        prisma.listing.create({
            data: {
                title: 'Vintage Leather Armchair',
                description: 'Mid-century modern leather armchair in cognac color. Minor patina adds character.',
                images: [
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c'
                ],
                category: 'Furniture',
                startingPrice: 400,
                currentBid: 550,
                startTime: new Date(now.getTime() - 15 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 33 * 60 * 60 * 1000),
                duration: 48,
                status: 'LIVE',
                sellerId: mike.id,
                bidCount: 6,
                viewCount: 42
            }
        })
    ]);
    console.log(`✅ Created ${listings.length} listings\n`);

    // Create bids for live listings
    console.log('💰 Creating bids...');
    const liveListing = listings[0]; // Rolex listing
    const macbookListing = listings[1];
    const gamingPcListing = listings[5];

    await Promise.all([
        // Bids on Rolex
        prisma.bid.create({
            data: {
                amount: 5000,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: liveListing.id,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 5200,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: liveListing.id,
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 5500,
                status: 'WINNING',
                bidderId: john.id,
                listingId: liveListing.id,
                createdAt: new Date(now.getTime() - 30 * 60 * 1000)
            }
        }),

        // Bids on MacBook
        prisma.bid.create({
            data: {
                amount: 2500,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: macbookListing.id,
                createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 2650,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: macbookListing.id,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 2800,
                status: 'WINNING',
                bidderId: sarah.id,
                listingId: macbookListing.id,
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
            }
        }),

        // Bids on Gaming PC
        prisma.bid.create({
            data: {
                amount: 2000,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: gamingPcListing.id,
                createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 2200,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: gamingPcListing.id,
                createdAt: new Date(now.getTime() - 15 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 2400,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: gamingPcListing.id,
                createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 2600,
                status: 'WINNING',
                bidderId: sarah.id,
                listingId: gamingPcListing.id,
                createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000)
            }
        })
    ]);
    console.log('✅ Created bids\n');

    // Create notifications
    console.log('🔔 Creating notifications...');
    await Promise.all([
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'BID_OUTBID',
                message: 'You have been outbid on "Vintage Rolex Submariner Watch"',
                link: `/listings/${liveListing.id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: sarah.id,
                type: 'BID_PLACED',
                message: 'New bid placed on "MacBook Pro 16" M3 Max"',
                link: `/listings/${macbookListing.id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: jane.id,
                type: 'BID_PLACED',
                message: 'New bid of $5500 placed on "Vintage Rolex Submariner Watch"',
                link: `/listings/${liveListing.id}`,
                read: false
            }
        })
    ]);
    console.log('✅ Created notifications\n');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${listings.length} listings created`);
    console.log(`   - 3 live auctions (ending at different times)`);
    console.log(`   - 2 upcoming auctions`);
    console.log(`   - Multiple bids and notifications\n`);
    console.log('🔐 Login credentials (all users):');
    console.log('   Password: password123\n');
    console.log('   Users:');
    console.log('   - john@example.com (BUYER)');
    console.log('   - jane@example.com (SELLER/VENDOR)');
    console.log('   - mike@example.com (VENDOR)');
    console.log('   - sarah@example.com (BUYER)');
    console.log('   - admin@example.com (ADMIN)\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
