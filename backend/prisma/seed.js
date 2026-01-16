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
    const testUserPassword = await bcrypt.hash('22446688', 10);

    // Create users
    console.log('👥 Creating users...');
    const users = await Promise.all([
        prisma.user.create({
            data: {
                name: 'Darshan Chavan',
                email: 'chavandarshan24@gmail.com',
                username: 'darshanchavan',
                password: testUserPassword,
                role: 'BUYER',
                emailVerified: new Date(),
                phone: '+919876543210',
                address: '123 Test Street, Mumbai, India'
            }
        }),
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

    const [darshan, john, jane, mike, sarah, admin] = users;

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
        }),

        // ENDED AUCTIONS - Test user WON these and needs to PAY
        prisma.listing.create({
            data: {
                title: 'Acoustic Guitar - Martin D-28',
                description: 'Beautiful Martin D-28 acoustic guitar in excellent condition. Comes with hard case.',
                images: [
                    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
                    'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f'
                ],
                category: 'Musical Instruments',
                startingPrice: 1000,
                currentBid: 1450,
                startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Ended 1 hour ago
                duration: 48,
                status: 'ENDED',
                sellerId: jane.id,
                bidCount: 8,
                viewCount: 95
            }
        }),
        prisma.listing.create({
            data: {
                title: 'iPhone 15 Pro Max 256GB',
                description: 'Brand new iPhone 15 Pro Max in Natural Titanium. Sealed box with full warranty.',
                images: [
                    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb',
                    'https://images.unsplash.com/photo-1592286927505-c5e471962609'
                ],
                category: 'Electronics',
                startingPrice: 800,
                currentBid: 1100,
                startTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000), // Ended 3 hours ago
                duration: 72,
                status: 'ENDED',
                sellerId: mike.id,
                bidCount: 12,
                viewCount: 156
            }
        }),
        prisma.listing.create({
            data: {
                title: 'Vintage Vinyl Record Collection',
                description: 'Collection of 50 classic rock vinyl records from the 60s-80s. All in great condition.',
                images: [
                    'https://images.unsplash.com/photo-1603048588665-791ca8aea617'
                ],
                category: 'Collectibles',
                startingPrice: 200,
                currentBid: 385,
                startTime: new Date(now.getTime() - 96 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 6 * 60 * 60 * 1000), // Ended 6 hours ago
                duration: 96,
                status: 'ENDED',
                sellerId: jane.id,
                bidCount: 6,
                viewCount: 67
            }
        }),

        // ENDED AUCTION - Other user won (SOLD status)
        prisma.listing.create({
            data: {
                title: 'PlayStation 5 Console',
                description: 'PS5 disc version, lightly used with two controllers and 5 games.',
                images: [
                    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db'
                ],
                category: 'Electronics',
                startingPrice: 350,
                currentBid: 475,
                startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 12 * 60 * 60 * 1000), // Ended 12 hours ago
                duration: 48,
                status: 'SOLD', // Already paid
                sellerId: mike.id,
                bidCount: 9,
                viewCount: 123
            }
        }),

        // ENDED AUCTION - No reserve met (UNSOLD)
        prisma.listing.create({
            data: {
                title: 'Antique Diamond Ring',
                description: 'Vintage diamond engagement ring, 1.5 carat, platinum setting.',
                images: [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e'
                ],
                category: 'Jewelry',
                startingPrice: 2000,
                reservePrice: 5000,
                currentBid: 2200,
                startTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                duration: 48,
                status: 'UNSOLD',
                sellerId: jane.id,
                bidCount: 3,
                viewCount: 45
            }
        })
    ]);
    console.log(`✅ Created ${listings.length} listings\n`);

    // Create bids for live listings
    console.log('💰 Creating bids...');
    const liveListing = listings[0]; // Rolex listing
    const macbookListing = listings[1];
    const gamingPcListing = listings[5];
    
    // Ended auctions where Darshan won
    const guitarListing = listings[8]; // Martin guitar
    const iphoneListing = listings[9]; // iPhone 15 Pro
    const vinylListing = listings[10]; // Vinyl collection
    const ps5Listing = listings[11]; // PS5 (already sold to Sarah)

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
        }),

        // Bids on Guitar (Darshan WON - needs to pay)
        prisma.bid.create({
            data: {
                amount: 1000,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: guitarListing.id,
                createdAt: new Date(now.getTime() - 45 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 1150,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: guitarListing.id,
                createdAt: new Date(now.getTime() - 40 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 1300,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: guitarListing.id,
                createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 1450,
                status: 'WINNING',
                bidderId: darshan.id,
                listingId: guitarListing.id,
                createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000)
            }
        }),

        // Bids on iPhone (Darshan WON - needs to pay)
        prisma.bid.create({
            data: {
                amount: 800,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: iphoneListing.id,
                createdAt: new Date(now.getTime() - 68 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 950,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: iphoneListing.id,
                createdAt: new Date(now.getTime() - 60 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 1050,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: iphoneListing.id,
                createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 1100,
                status: 'WINNING',
                bidderId: darshan.id,
                listingId: iphoneListing.id,
                createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000)
            }
        }),

        // Bids on Vinyl Collection (Darshan WON - needs to pay)
        prisma.bid.create({
            data: {
                amount: 200,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: vinylListing.id,
                createdAt: new Date(now.getTime() - 90 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 275,
                status: 'OUTBID',
                bidderId: sarah.id,
                listingId: vinylListing.id,
                createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 350,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: vinylListing.id,
                createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 385,
                status: 'WINNING',
                bidderId: darshan.id,
                listingId: vinylListing.id,
                createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000)
            }
        }),

        // Bids on PS5 (Sarah won and PAID)
        prisma.bid.create({
            data: {
                amount: 350,
                status: 'OUTBID',
                bidderId: john.id,
                listingId: ps5Listing.id,
                createdAt: new Date(now.getTime() - 45 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 420,
                status: 'OUTBID',
                bidderId: darshan.id,
                listingId: ps5Listing.id,
                createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000)
            }
        }),
        prisma.bid.create({
            data: {
                amount: 475,
                status: 'WON',
                bidderId: sarah.id,
                listingId: ps5Listing.id,
                createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
        })
    ]);
    console.log('✅ Created bids\n');

    // Create payment for PS5 (already paid by Sarah)
    console.log('💳 Creating payment records...');
    await prisma.payment.create({
        data: {
            amount: 475,
            currency: 'USD',
            status: 'succeeded',
            stripePaymentIntentId: 'pi_test_' + Date.now(),
            buyerId: sarah.id,
            sellerId: mike.id,
            listingId: ps5Listing.id,
            paidAt: new Date(now.getTime() - 10 * 60 * 60 * 1000)
        }
    });
    console.log('✅ Created payment records\n');

    // Create notifications
    console.log('🔔 Creating notifications...');
    await Promise.all([
        prisma.notification.create({
            data: {
                userId: darshan.id,
                type: 'AUCTION_WON',
                message: 'Congratulations! You won the auction for "Acoustic Guitar - Martin D-28". Please complete payment within 48 hours.',
                link: `/listings/${guitarListing.id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: darshan.id,
                type: 'AUCTION_WON',
                message: 'Congratulations! You won the auction for "iPhone 15 Pro Max 256GB". Please complete payment within 48 hours.',
                link: `/listings/${iphoneListing.id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: darshan.id,
                type: 'AUCTION_WON',
                message: 'Congratulations! You won the auction for "Vintage Vinyl Record Collection". Please complete payment within 48 hours.',
                link: `/listings/${vinylListing.id}`,
                read: false
            }
        }),
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
    console.log(`   - 6 live auctions`);
    console.log(`   - 2 upcoming auctions`);
    console.log(`   - 3 ended auctions (Test user WON - needs to pay)`);
    console.log(`   - 1 sold auction (already paid)`);
    console.log(`   - 1 unsold auction (reserve not met)\n`);
    console.log('🔐 Login credentials:');
    console.log('   TEST USER (Has 3 winning auctions to pay):');
    console.log('   - Email: chavandarshan24@gmail.com');
    console.log('   - Password: 22446688\n');
    console.log('   Other users (password: password123):');
    console.log('   - john@example.com (BUYER)');
    console.log('   - jane@example.com (SELLER/VENDOR)');
    console.log('   - mike@example.com (VENDOR)');
    console.log('   - sarah@example.com (BUYER)');
    console.log('   - admin@example.com (ADMIN)\n');
    console.log('💰 Test User Winning Auctions (ENDED - needs payment):');
    console.log('   1. Acoustic Guitar - Martin D-28: $1,450.00');
    console.log('   2. iPhone 15 Pro Max 256GB: $1,100.00');
    console.log('   3. Vintage Vinyl Record Collection: $385.00');
    console.log('   Total to pay: $2,935.00\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
