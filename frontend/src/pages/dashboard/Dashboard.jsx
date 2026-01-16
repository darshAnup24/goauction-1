import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, DollarSign, Clock, Eye, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import listingsService from '../../services/listings.service';
import bidsService from '../../services/bids.service';
import socketService from '../../services/socket.service';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeListings: 0,
        totalListings: 0,
        totalBids: 0,
        totalSales: 0,
        revenue: 0,
        wonAuctions: 0,
        activeParticipation: 0
    });
    const [myListings, setMyListings] = useState([]);
    const [myBids, setMyBids] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    // Listen for payment success to refresh dashboard
    useEffect(() => {
        if (user) {
            console.log('Setting up payment:success listener for user:', user.id);

            socketService.on('payment:success', (data) => {
                console.log('✅ Payment success event received:', data);
                fetchDashboardData();
                toast.success('Payment completed successfully!');
            });

            // Also listen for generic auction updates
            socketService.on('auction:updated', (data) => {
                console.log('📢 Auction updated event received:', data);
                fetchDashboardData();
            });

            // Polling fallback - refresh every 30 seconds to catch any missed updates
            const pollInterval = setInterval(() => {
                console.log('🔄 Polling dashboard data...');
                fetchDashboardData();
            }, 30000); // 30 seconds

            return () => {
                socketService.off('payment:success');
                socketService.off('auction:updated');
                clearInterval(pollInterval);
            };
        }
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Fetch user's listings
            const listingsResponse = await listingsService.getMyListings();
            const listingsData = listingsResponse.data || listingsResponse.listings || listingsResponse || [];
            setMyListings(listingsData.slice(0, 5)); // Recent 5

            // Fetch user's bids with payment information
            const bidsResponse = await bidsService.getMyBids();
            const bidsData = bidsResponse.data || bidsResponse.bids || bidsResponse || [];
            setMyBids(bidsData.slice(0, 5)); // Recent 5

            // Calculate stats
            const activeListings = listingsData.filter(l => l.status === 'LIVE').length;
            const soldListings = listingsData.filter(l => l.status === 'SOLD');
            const revenue = soldListings.reduce((sum, l) => sum + (l.currentBid || 0), 0);

            const wonAuctions = bidsData.filter(b =>
                b.listing?.status === 'SOLD' && b.listing?.winnerId === user.id
            ).length;

            const activeParticipation = bidsData.filter(b =>
                b.listing?.status === 'LIVE'
            ).length;

            setStats({
                activeListings,
                totalListings: listingsData.length,
                totalBids: bidsData.length,
                totalSales: soldListings.length,
                revenue,
                wonAuctions,
                activeParticipation
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const calculateTimeLeft = (endTime) => {
        const diff = new Date(endTime) - new Date();
        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    const statCards = [
        {
            title: 'Active Listings',
            value: stats.activeListings,
            total: stats.totalListings,
            icon: Package,
            color: 'blue',
            link: '/dashboard/listings'
        },
        {
            title: 'Total Bids',
            value: stats.totalBids,
            subtitle: `${stats.activeParticipation} active`,
            icon: TrendingUp,
            color: 'green',
            link: '/dashboard/bids'
        },
        {
            title: 'Won Auctions',
            value: stats.wonAuctions,
            subtitle: 'Completed',
            icon: Eye,
            color: 'purple',
            link: '/dashboard/orders'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.revenue.toFixed(2)}`,
            subtitle: `${stats.totalSales} sold`,
            icon: DollarSign,
            color: 'yellow',
            link: '/dashboard/sales'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name || user?.username}!
                    </h1>
                    <p className="text-gray-600">Here's what's happening with your auctions</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={index}
                                to={stat.link}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-l-4 border-blue-500"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                {stat.total && (
                                    <p className="text-sm text-gray-500">of {stat.total} total</p>
                                )}
                                {stat.subtitle && (
                                    <p className="text-sm text-gray-500">{stat.subtitle}</p>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* My Active Listings */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Active Listings</h2>
                            <Link to="/dashboard/listings" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                View All →
                            </Link>
                        </div>

                        {myListings.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No active listings</p>
                                <Link to="/dashboard/listings/new" className="btn-primary inline-block">
                                    Create Listing
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myListings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        to={`/listings/${listing.id}`}
                                        className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                                    >
                                        <img
                                            src={listing.images?.[0] || '/placeholder.jpg'}
                                            alt={listing.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                    {listing.title}
                                                </h3>
                                                <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${listing.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                                                    listing.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {listing.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-blue-600 font-bold">
                                                    ${(listing.currentBid || listing.startingPrice).toFixed(2)}
                                                </span>
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {listing.bidCount || 0} bids
                                                </span>
                                                {listing.status === 'LIVE' && (
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {calculateTimeLeft(listing.endTime)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Active Bids */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Active Bids</h2>
                            <Link to="/dashboard/bids" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                View All →
                            </Link>
                        </div>

                        {myBids.length === 0 ? (
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No active bids</p>
                                <Link to="/listings" className="btn-primary inline-block">
                                    Browse Auctions
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myBids.map((bid) => {
                                    const listing = bid.listing;
                                    if (!listing) return null;

                                    const isEnded = listing.status === 'ENDED' || listing.status === 'SOLD' || listing.status === 'UNSOLD';
                                    // Check if payment exists - listing has payment array or status is SOLD
                                    const isPaid = listing.status === 'SOLD' || (listing.payments && listing.payments.length > 0 && listing.payments.some(p => p.status === 'succeeded'));

                                    // Check if this user is the winner
                                    // Winner is determined by having the highest bid (currentBid) on an ENDED auction
                                    // Use toFixed to avoid floating point precision issues
                                    const isHighestBidder = bid.amount.toFixed(2) === listing.currentBid.toFixed(2);
                                    const isWinner = isEnded && isHighestBidder && !isPaid && listing.status === 'ENDED';

                                    // For live auctions, check if currently winning
                                    const isWinning = listing.status === 'LIVE' && isHighestBidder;

                                    return (
                                        <div
                                            key={bid.id}
                                            className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                                        >
                                            <Link to={`/listings/${listing.id}`} className="flex-shrink-0">
                                                <img
                                                    src={listing.images?.[0] || '/placeholder.jpg'}
                                                    alt={listing.title}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <Link to={`/listings/${listing.id}`} className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-blue-600">
                                                            {listing.title}
                                                        </h3>
                                                    </Link>
                                                    {isPaid ? (
                                                        <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 flex-shrink-0">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Paid
                                                        </span>
                                                    ) : isWinner ? (
                                                        <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 flex items-center gap-1 flex-shrink-0">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                            Won!
                                                        </span>
                                                    ) : isWinning ? (
                                                        <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 flex items-center gap-1 flex-shrink-0">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                            Winning
                                                        </span>
                                                    ) : listing.status === 'UNSOLD' ? (
                                                        <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 flex items-center gap-1 flex-shrink-0">
                                                            Unsold
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 flex items-center gap-1 flex-shrink-0">
                                                            <ArrowDownRight className="w-3 h-3" />
                                                            Outbid
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                                    <span className="text-gray-600">
                                                        Your bid: <span className="font-bold text-gray-900">${bid.amount.toFixed(2)}</span>
                                                    </span>
                                                    {listing.currentBid && (
                                                        <span className="text-gray-600">
                                                            Current: <span className="font-bold text-blue-600">${listing.currentBid.toFixed(2)}</span>
                                                        </span>
                                                    )}
                                                    {listing.status === 'LIVE' && (
                                                        <span className="text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {calculateTimeLeft(listing.endTime)}
                                                        </span>
                                                    )}
                                                    {isWinner && (
                                                        <Link
                                                            to={`/payment?listing=${listing.id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center gap-2 shadow-md"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                            Pay Now
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/dashboard/listings/new"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-6 transition-all text-center"
                        >
                            <Package className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="font-semibold mb-1">Create Listing</h3>
                            <p className="text-sm text-blue-100">Start a new auction</p>
                        </Link>
                        <Link
                            to="/listings"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-6 transition-all text-center"
                        >
                            <Eye className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="font-semibold mb-1">Browse Auctions</h3>
                            <p className="text-sm text-blue-100">Find items to bid on</p>
                        </Link>
                        <Link
                            to="/dashboard/profile"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-6 transition-all text-center"
                        >
                            <TrendingUp className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="font-semibold mb-1">View Profile</h3>
                            <p className="text-sm text-blue-100">Manage your account</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
