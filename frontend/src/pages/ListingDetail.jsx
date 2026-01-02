import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, Users, Gavel, Star } from 'lucide-react';
import listingsService from '../services/listings.service';
import BiddingPanel from '../components/auction/BiddingPanel';
import ImageGallery from '../components/auction/ImageGallery';
import CountdownTimer from '../components/auction/CountdownTimer';
import Loading from '../components/common/Loading';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasExpiredRef = useRef(false);

  const fetchListing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listingsService.getListingById(id);
      
      if (data.success) {
        setListing(data.listing);
      } else {
        throw new Error(data.error || 'Failed to fetch listing');
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load listing');
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleBidPlaced = (data) => {
    // Update listing with new bid data
    setListing((prev) => ({
      ...prev,
      currentBid: data.listing.currentBid,
      bidCount: data.listing.bidCount,
    }));
  };

  const handleAuctionExpire = useCallback(() => {
    // Prevent multiple toast notifications
    if (hasExpiredRef.current) return;
    
    hasExpiredRef.current = true;
    toast.success('Auction has ended!');
    
    // Update listing status without refetching
    setListing((prev) => ({
      ...prev,
      status: 'ENDED'
    }));
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The listing you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/listings')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const uniqueBidders = new Set(listing.bids?.map(b => b.bidderId) || []).size;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/listings" className="hover:text-blue-600">Auctions</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-semibold">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <ImageGallery images={listing.images} />
            </div>

            {/* Listing Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full uppercase">
                      {listing.category}
                    </span>
                    <span className={`
                      px-3 py-1 text-sm font-bold rounded-full
                      ${listing.status === 'LIVE' ? 'bg-green-100 text-green-800' : ''}
                      ${listing.status === 'ENDED' ? 'bg-gray-100 text-gray-800' : ''}
                      ${listing.status === 'SOLD' ? 'bg-purple-100 text-purple-800' : ''}
                      ${listing.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                      {listing.status}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                </div>
              </div>

              {/* Countdown Timer */}
              {listing.status === 'LIVE' && (
                <div className="mb-6">
                  <CountdownTimer 
                    endTime={listing.endTime}
                    onExpire={handleAuctionExpire}
                    size="lg"
                  />
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              {/* Seller Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
                <div className="flex items-center gap-4">
                  {listing.seller?.avatar ? (
                    <img
                      src={listing.seller.avatar}
                      alt={listing.seller.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {listing.seller?.username?.[0]?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-lg">
                        {listing.seller?.username || 'Seller'}
                      </p>
                      {listing.seller?.isVendor && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          Verified Seller
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{listing.seller?.name || ''}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {listing.seller?.rating?.toFixed(1) || '5.0'} rating
                      </span>
                      {listing.seller?.totalRatings > 0 && (
                        <span className="text-xs text-gray-500">
                          ({listing.seller.totalRatings} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listing.viewCount || 0}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gavel className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listing.bidCount || 0}</p>
                  <p className="text-sm text-gray-600">Bids</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{uniqueBidders}</p>
                  <p className="text-sm text-gray-600">Bidders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Panel (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <BiddingPanel
                listingId={listing.id}
                currentBid={listing.currentBid}
                startingPrice={listing.startingPrice}
                bidCount={listing.bidCount || 0}
                status={listing.status}
                endTime={listing.endTime}
                sellerId={listing.sellerId}
                initialBids={listing.bids || []}
                onBidPlaced={handleBidPlaced}
              />

              {/* Additional Info Card */}
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Auction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-semibold text-gray-900">
                      ${listing.startingPrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  {listing.reservePrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserve Price:</span>
                      <span className="font-semibold text-gray-900">
                        ${listing.reservePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(listing.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ends:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(listing.endTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">
                      {listing.duration} hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
