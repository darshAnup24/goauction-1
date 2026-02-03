const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.rating.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    console.log('👥 Creating users...');
    
    const john = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'chavandarshan24@gmail.com',
            username: 'john',
            password: hashedPassword,
            role: 'BUYER',
            isVendor: true,
            emailVerified: new Date(),
            phone: '+1234567890',
            address: '123 Main St, New York, NY 10001',
            rating: 4.5,
            totalRatings: 10
        }
    });

    const alice = await prisma.user.create({
        data: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            username: 'alice',
            password: hashedPassword,
            role: 'BUYER',
            isVendor: true,
            emailVerified: new Date(),
            phone: '+1234567891',
            address: '456 Oak Ave, Los Angeles, CA 90001',
            rating: 4.8,
            totalRatings: 25
        }
    });

    const bob = await prisma.user.create({
        data: {
            name: 'Bob Smith',
            email: 'bob@example.com',
            username: 'bob',
            password: hashedPassword,
            role: 'BUYER',
            isVendor: true,
            emailVerified: new Date(),
            phone: '+1234567892',
            address: '789 Pine Rd, Chicago, IL 60601',
            rating: 4.2,
            totalRatings: 15
        }
    });

    const carol = await prisma.user.create({
        data: {
            name: 'Carol Williams',
            email: 'carol@example.com',
            username: 'carol',
            password: hashedPassword,
            role: 'BUYER',
            isVendor: true,
            emailVerified: new Date(),
            phone: '+1234567893',
            address: '321 Elm St, Houston, TX 77001',
            rating: 4.6,
            totalRatings: 18
        }
    });

    console.log(`✅ Created 4 users\n`);

    // Create listings
    console.log('📦 Creating listings...');
    const now = new Date();
    
    // Tomorrow's times (Feb 4, 2026)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrow11am = new Date(tomorrow);
    tomorrow11am.setHours(11, 0, 0, 0);
    
    const tomorrow12pm = new Date(tomorrow);
    tomorrow12pm.setHours(12, 0, 0, 0);
    
    const tomorrow1pm = new Date(tomorrow);
    tomorrow1pm.setHours(13, 0, 0, 0);
    
    const tomorrow2pm = new Date(tomorrow);
    tomorrow2pm.setHours(14, 0, 0, 0);

    const listings = await Promise.all([
        // ============ LIVE AUCTIONS (ending tomorrow) ============
        // Listing by Alice - ends tomorrow 11am
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
                currentBid: 6200,
                startTime: new Date(now.getTime() - 20 * 60 * 60 * 1000),
                endTime: tomorrow11am,
                duration: 24,
                status: 'LIVE',
                sellerId: alice.id,
                bidCount: 8,
                viewCount: 145
            }
        }),
        // Listing by Bob - ends tomorrow 12pm
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
                currentBid: 3100,
                startTime: new Date(now.getTime() - 18 * 60 * 60 * 1000),
                endTime: tomorrow12pm,
                duration: 24,
                status: 'LIVE',
                sellerId: bob.id,
                bidCount: 12,
                viewCount: 210
            }
        }),
        // Listing by Carol - ends tomorrow 1pm
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
                currentBid: 1650,
                startTime: new Date(now.getTime() - 15 * 60 * 60 * 1000),
                endTime: tomorrow1pm,
                duration: 24,
                status: 'LIVE',
                sellerId: carol.id,
                bidCount: 6,
                viewCount: 89
            }
        }),
        // Listing by Alice - ends tomorrow 2pm
        prisma.listing.create({
            data: {
                title: 'Gaming PC - RTX 4090, i9-13900K',
                description: 'High-end gaming PC built 6 months ago. RTX 4090, Intel i9-13900K, 64GB RAM, 2TB NVMe.',
                images: [
                    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c'
                ],
                category: 'Electronics',
                startingPrice: 2000,
                currentBid: 2850,
                startTime: new Date(now.getTime() - 22 * 60 * 60 * 1000),
                endTime: tomorrow2pm,
                duration: 24,
                status: 'LIVE',
                sellerId: alice.id,
                bidCount: 10,
                viewCount: 178
            }
        }),
        // Listing by Bob - ends tomorrow 11am
        prisma.listing.create({
            data: {
                title: 'Fender Stratocaster Electric Guitar',
                description: 'Classic Sunburst Fender Stratocaster, American made, with hard case.',
                images: [
                    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1'
                ],
                category: 'Musical Instruments',
                startingPrice: 800,
                currentBid: 1150,
                startTime: new Date(now.getTime() - 16 * 60 * 60 * 1000),
                endTime: tomorrow11am,
                duration: 24,
                status: 'LIVE',
                sellerId: bob.id,
                bidCount: 7,
                viewCount: 95
            }
        }),

        // ============ UPCOMING AUCTIONS ============
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
                currentBid: 0,
                startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 28 * 60 * 60 * 1000),
                duration: 24,
                status: 'UPCOMING',
                sellerId: carol.id,
                viewCount: 45
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
                currentBid: 0,
                startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 30 * 60 * 60 * 1000),
                duration: 24,
                status: 'UPCOMING',
                sellerId: alice.id,
                viewCount: 67
            }
        }),

        // ============ ENDED AUCTIONS - JOHN WON (needs to pay) ============
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
                endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
                duration: 48,
                status: 'ENDED',
                sellerId: alice.id,
                winnerId: john.id,
                bidCount: 8,
                viewCount: 125
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
                endTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                duration: 72,
                status: 'ENDED',
                sellerId: bob.id,
                winnerId: john.id,
                bidCount: 15,
                viewCount: 198
            }
        }),
        prisma.listing.create({
            data: {
                title: 'Canon EOS R5 Camera Body',
                description: 'Professional mirrorless camera, excellent condition with low shutter count.',
                images: [
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'
                ],
                category: 'Electronics',
                startingPrice: 2500,
                currentBid: 2950,
                startTime: new Date(now.getTime() - 50 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
                duration: 48,
                status: 'ENDED',
                sellerId: carol.id,
                winnerId: john.id,
                bidCount: 11,
                viewCount: 167
            }
        }),
        prisma.listing.create({
            data: {
                title: 'DJI Mavic 3 Pro Drone',
                description: 'Brand new DJI Mavic 3 Pro with Fly More combo. Never flown, sealed box.',
                images: [
                    'https://images.unsplash.com/photo-1473968512647-3e447244af8f'
                ],
                category: 'Electronics',
                startingPrice: 1500,
                currentBid: 1850,
                startTime: new Date(now.getTime() - 60 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
                duration: 48,
                status: 'ENDED',
                sellerId: alice.id,
                winnerId: john.id,
                bidCount: 9,
                viewCount: 143
            }
        }),

        // ============ SOLD AUCTIONS (payment completed) ============
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
                startTime: new Date(now.getTime() - 96 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
                duration: 48,
                status: 'SOLD',
                sellerId: bob.id,
                winnerId: john.id,
                bidCount: 12,
                viewCount: 189
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
                startTime: new Date(now.getTime() - 120 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
                duration: 48,
                status: 'SOLD',
                sellerId: carol.id,
                winnerId: alice.id,
                bidCount: 8,
                viewCount: 98
            }
        }),

        // ============ UNSOLD AUCTIONS (reserve not met) ============
        prisma.listing.create({
            data: {
                title: 'Antique Diamond Ring',
                description: 'Vintage diamond engagement ring, 1.5 carat, platinum setting.',
                images: [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e'
                ],
                category: 'Jewelry',
                startingPrice: 3000,
                reservePrice: 5000,
                currentBid: 3800,
                startTime: new Date(now.getTime() - 96 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
                duration: 48,
                status: 'UNSOLD',
                sellerId: carol.id,
                bidCount: 5,
                viewCount: 112
            }
        })
    ]);

    console.log(`✅ Created ${listings.length} listings\n`);

    // Create bids for LIVE auctions (multiple users bidding)
    console.log('💰 Creating bids...');
    
    // Bids on Rolex Watch (listing 0) - Alice's listing
    await prisma.bid.createMany({
        data: [
            { amount: 5200, bidderId: john.id, listingId: listings[0].id, status: 'OUTBID' },
            { amount: 5400, bidderId: bob.id, listingId: listings[0].id, status: 'OUTBID' },
            { amount: 5600, bidderId: carol.id, listingId: listings[0].id, status: 'OUTBID' },
            { amount: 5800, bidderId: john.id, listingId: listings[0].id, status: 'OUTBID' },
            { amount: 6000, bidderId: bob.id, listingId: listings[0].id, status: 'OUTBID' },
            { amount: 6200, bidderId: john.id, listingId: listings[0].id, status: 'WINNING' }
        ]
    });

    // Bids on MacBook (listing 1) - Bob's listing
    await prisma.bid.createMany({
        data: [
            { amount: 2600, bidderId: john.id, listingId: listings[1].id, status: 'OUTBID' },
            { amount: 2700, bidderId: alice.id, listingId: listings[1].id, status: 'OUTBID' },
            { amount: 2800, bidderId: carol.id, listingId: listings[1].id, status: 'OUTBID' },
            { amount: 2900, bidderId: john.id, listingId: listings[1].id, status: 'OUTBID' },
            { amount: 3000, bidderId: alice.id, listingId: listings[1].id, status: 'OUTBID' },
            { amount: 3100, bidderId: john.id, listingId: listings[1].id, status: 'WINNING' }
        ]
    });

    // Bids on Persian Rug (listing 2) - Carol's listing
    await prisma.bid.createMany({
        data: [
            { amount: 1300, bidderId: john.id, listingId: listings[2].id, status: 'OUTBID' },
            { amount: 1400, bidderId: alice.id, listingId: listings[2].id, status: 'OUTBID' },
            { amount: 1500, bidderId: bob.id, listingId: listings[2].id, status: 'OUTBID' },
            { amount: 1650, bidderId: john.id, listingId: listings[2].id, status: 'WINNING' }
        ]
    });

    // Bids on Gaming PC (listing 3) - Alice's listing
    await prisma.bid.createMany({
        data: [
            { amount: 2200, bidderId: bob.id, listingId: listings[3].id, status: 'OUTBID' },
            { amount: 2400, bidderId: carol.id, listingId: listings[3].id, status: 'OUTBID' },
            { amount: 2500, bidderId: john.id, listingId: listings[3].id, status: 'OUTBID' },
            { amount: 2650, bidderId: bob.id, listingId: listings[3].id, status: 'OUTBID' },
            { amount: 2750, bidderId: carol.id, listingId: listings[3].id, status: 'OUTBID' },
            { amount: 2850, bidderId: john.id, listingId: listings[3].id, status: 'WINNING' }
        ]
    });

    // Bids on Fender Guitar (listing 4) - Bob's listing
    await prisma.bid.createMany({
        data: [
            { amount: 850, bidderId: alice.id, listingId: listings[4].id, status: 'OUTBID' },
            { amount: 900, bidderId: john.id, listingId: listings[4].id, status: 'OUTBID' },
            { amount: 1000, bidderId: carol.id, listingId: listings[4].id, status: 'OUTBID' },
            { amount: 1050, bidderId: alice.id, listingId: listings[4].id, status: 'OUTBID' },
            { amount: 1150, bidderId: john.id, listingId: listings[4].id, status: 'WINNING' }
        ]
    });

    // Bids on ENDED auctions John won
    // Martin Guitar (listing 7)
    await prisma.bid.createMany({
        data: [
            { amount: 1100, bidderId: bob.id, listingId: listings[7].id, status: 'OUTBID' },
            { amount: 1200, bidderId: carol.id, listingId: listings[7].id, status: 'OUTBID' },
            { amount: 1300, bidderId: bob.id, listingId: listings[7].id, status: 'OUTBID' },
            { amount: 1450, bidderId: john.id, listingId: listings[7].id, status: 'WON' }
        ]
    });

    // iPhone (listing 8)
    await prisma.bid.createMany({
        data: [
            { amount: 850, bidderId: alice.id, listingId: listings[8].id, status: 'OUTBID' },
            { amount: 900, bidderId: carol.id, listingId: listings[8].id, status: 'OUTBID' },
            { amount: 1000, bidderId: alice.id, listingId: listings[8].id, status: 'OUTBID' },
            { amount: 1100, bidderId: john.id, listingId: listings[8].id, status: 'WON' }
        ]
    });

    // Canon EOS R5 (listing 9)
    await prisma.bid.createMany({
        data: [
            { amount: 2600, bidderId: alice.id, listingId: listings[9].id, status: 'OUTBID' },
            { amount: 2700, bidderId: bob.id, listingId: listings[9].id, status: 'OUTBID' },
            { amount: 2850, bidderId: alice.id, listingId: listings[9].id, status: 'OUTBID' },
            { amount: 2950, bidderId: john.id, listingId: listings[9].id, status: 'WON' }
        ]
    });

    // DJI Mavic 3 Pro (listing 10)
    await prisma.bid.createMany({
        data: [
            { amount: 1600, bidderId: bob.id, listingId: listings[10].id, status: 'OUTBID' },
            { amount: 1700, bidderId: carol.id, listingId: listings[10].id, status: 'OUTBID' },
            { amount: 1800, bidderId: bob.id, listingId: listings[10].id, status: 'OUTBID' },
            { amount: 1850, bidderId: john.id, listingId: listings[10].id, status: 'WON' }
        ]
    });

    console.log('✅ Created bids\n');

    // Create notifications for John
    console.log('🔔 Creating notifications...');
    await Promise.all([
        // Won auctions - need to pay
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'AUCTION_WON',
                message: '🎉 Congratulations! You won the auction for Acoustic Guitar - Martin D-28. Please complete payment.',
                link: `/listings/${listings[7].id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'AUCTION_WON',
                message: '🎉 Congratulations! You won the auction for iPhone 15 Pro Max 256GB. Please complete payment.',
                link: `/listings/${listings[8].id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'AUCTION_WON',
                message: '🎉 Congratulations! You won the auction for Canon EOS R5 Camera Body. Please complete payment.',
                link: `/listings/${listings[9].id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'AUCTION_WON',
                message: '🎉 Congratulations! You won the auction for DJI Mavic 3 Pro Drone. Please complete payment.',
                link: `/listings/${listings[10].id}`,
                read: false
            }
        }),
        // Auction ending notifications
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'AUCTION_ENDING_SOON',
                message: '⏰ Vintage Rolex Watch auction ends tomorrow at 11 AM!',
                link: `/listings/${listings[0].id}`,
                read: false
            }
        }),
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'BID_PLACED',
                message: '✅ Your bid of $6,200 on Vintage Rolex Watch is currently winning!',
                link: `/listings/${listings[0].id}`,
                read: true
            }
        }),
        // Past payment notification
        prisma.notification.create({
            data: {
                userId: john.id,
                type: 'PAYMENT_RECEIVED',
                message: '💰 Payment of $475 received for PlayStation 5 Console',
                link: `/listings/${listings[11].id}`,
                read: true
            }
        })
    ]);
    console.log('✅ Created notifications\n');

    // Create payment for SOLD listing
    console.log('💳 Creating payments...');
    await prisma.payment.create({
        data: {
            amount: 475,
            currency: 'USD',
            status: 'succeeded',
            buyerId: john.id,
            sellerId: bob.id,
            listingId: listings[11].id,
            paidAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
    });
    await prisma.payment.create({
        data: {
            amount: 385,
            currency: 'USD',
            status: 'succeeded',
            buyerId: alice.id,
            sellerId: carol.id,
            listingId: listings[12].id,
            paidAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
        }
    });
    console.log('✅ Created payments\n');

    console.log('========================================');
    console.log('🎉 Database seeding completed!');
    console.log('========================================');
    console.log('\n📊 Summary:');
    console.log('   👤 Users: 4 (John, Alice, Bob, Carol)');
    console.log(`   📦 Listings: ${listings.length}`);
    console.log('      - LIVE: 5 (ending tomorrow 11am-2pm)');
    console.log('      - UPCOMING: 2');
    console.log('      - ENDED: 4 (John won - needs to pay)');
    console.log('      - SOLD: 2');
    console.log('      - UNSOLD: 1');
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: chavandarshan24@gmail.com');
    console.log('   Password: password123');
    console.log('\n💰 John has WON 4 auctions awaiting payment:');
    console.log('   1. Acoustic Guitar - Martin D-28 ($1,450)');
    console.log('   2. iPhone 15 Pro Max 256GB ($1,100)');
    console.log('   3. Canon EOS R5 Camera Body ($2,950)');
    console.log('   4. DJI Mavic 3 Pro Drone ($1,850)');
    console.log('   Total: $7,350\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
