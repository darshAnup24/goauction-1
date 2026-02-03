import { useState, useEffect, useCallback } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, Clock, TrendingUp, DollarSign, Filter } from 'lucide-react';
import SearchWithSuggestions from '../components/common/SearchWithSuggestions';
import listingsService from '../services/listings.service';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'All',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Collectibles',
    'Art',
    'Jewelry',
    'Automotive',
    'Musical Instruments',
    'Furniture',
    'Other'
];

const SORT_OPTIONS = [
    { value: 'newly-listed', label: 'Newly Listed' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'most-bids', label: 'Most Bids' },
];

const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || 'All',
        status: searchParams.get('status') || 'LIVE',
        sortBy: searchParams.get('sortBy') || 'newly-listed',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        page: parseInt(searchParams.get('page')) || 1,
        limit: 12
    });

    // Debounce the search term to avoid excessive API calls
    const debouncedSearch = useDebounce(filters.search, 500);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = {
                ...filters,
                search: debouncedSearch, // Use debounced search value
                category: filters.category === 'All' ? '' : filters.category
            };
            const response = await listingsService.getAllListings(queryParams);
            const data = response.data || response; // Handle both formats
            setListings(data.listings || []);
            setTotalCount(data.pagination?.total || data.total || 0);
        } catch (error) {
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    }, [filters, debouncedSearch]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // Update URL params when filters change (including debounced search)
    useEffect(() => {
        const params = { ...filters };
        if (debouncedSearch !== filters.search) {
            // Don't update URL until search is debounced
            return;
        }
        setSearchParams(params);
    }, [filters, debouncedSearch, setSearchParams]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleSearchSubmit = (searchTerm) => {
        handleFilterChange('search', searchTerm);
    };

    const calculateTimeLeft = (endTime) => {
        const diff = new Date(endTime) - new Date();
        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const calculateTimeToStart = (startTime) => {
        const diff = new Date(startTime) - new Date();
        if (diff <= 0) return 'Started';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (loading && filters.page === 1) {
        return <Loading fullScreen />;
    }

    const totalPages = Math.ceil(totalCount / filters.limit);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Auctions</h1>
                    <p className="text-gray-600">{totalCount} active auctions available</p>
                </div>

                {/* Search Bar with Suggestions */}
                <div className="mb-6 flex gap-3">
                    <SearchWithSuggestions
                        placeholder="Search auctions by title, description..."
                        className="flex-1"
                        onSearch={handleSearchSubmit}
                    />
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="LIVE">Live Auctions</option>
                                    <option value="ENDING-SOON">Ending Soon</option>
                                    <option value="UPCOMING">Upcoming</option>
                                    <option value="ENDED">Ended Auctions</option>
                                    <option value="ALL">All</option>
                                </select>
                            </div>

                            {/* Min Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    placeholder="$0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Max Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    placeholder="Any"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{listings.length} of {totalCount} results</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Sort */}
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* View Mode */}
                        <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Listings */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loading />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600 text-lg mb-4">No auctions found</p>
                        <button
                            onClick={() => setFilters({ search: '', category: 'All', status: 'LIVE', sortBy: 'newly-listed', minPrice: '', maxPrice: '', page: 1, limit: 12 })}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                to={`/listings/${listing.id}`}
                                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden block relative ${viewMode === 'list' ? 'flex' : ''}`}
                            >
                                <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full'}`}>
                                    <img
                                        src={listing.images?.[0] || '/placeholder.jpg'}
                                        alt={listing.title}
                                        className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-56'}`}
                                    />
                                    <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full ${listing.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                                        listing.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-800' :
                                            listing.status === 'ENDED' ? 'bg-gray-100 text-gray-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {listing.status}
                                    </span>
                                </div>
                                <div className="p-5 flex-1">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                            {listing.title}
                                        </h3>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${(listing.currentBid || listing.startingPrice).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">
                                                {listing.status === 'UPCOMING' ? 'Starts In' : 'Time Left'}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {listing.status === 'UPCOMING' && listing.startTime
                                                    ? calculateTimeToStart(listing.startTime)
                                                    : calculateTimeLeft(listing.endTime)
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <TrendingUp className="w-4 h-4" />
                                            {listing.bidCount || 0} bids
                                        </div>
                                        <span className="text-blue-600 font-semibold text-sm hover:text-blue-700">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                            disabled={filters.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handleFilterChange('page', page)}
                                    className={`px-4 py-2 border rounded-lg ${filters.page === page
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                            disabled={filters.page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Listings;
