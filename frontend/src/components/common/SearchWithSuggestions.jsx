import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import listingsService from '../../services/listings.service';

/**
 * Search component with autocomplete suggestions
 * Features:
 * - Debounced search suggestions (500ms)
 * - Click outside to close
 * - Keyboard navigation (up/down arrows, enter)
 * - Clear search button
 */
const SearchWithSuggestions = ({
    placeholder = "Search auctions...",
    className = "",
    onSearch,
    autoFocus = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Debounce search term to avoid excessive API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch suggestions when debounced search term changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const response = await listingsService.searchListings(debouncedSearchTerm);
                const listings = response.listings || [];

                // Limit to top 5 suggestions
                setSuggestions(listings.slice(0, 5));
                setShowSuggestions(listings.length > 0);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedIndex(-1);
    };

    const handleSearch = (term = searchTerm) => {
        if (!term || term.trim().length === 0) return;

        setShowSuggestions(false);

        if (onSearch) {
            onSearch(term);
        } else {
            navigate(`/listings?search=${encodeURIComponent(term)}`);
        }
    };

    const handleSuggestionClick = (listing) => {
        setSearchTerm(listing.title);
        setShowSuggestions(false);
        navigate(`/listings/${listing.id}`);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'Enter') {
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative flex items-center">
                <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    autoFocus={autoFocus}
                    className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Suggestions
                        </div>
                        {suggestions.map((listing, index) => (
                            <button
                                key={listing.id}
                                onClick={() => handleSuggestionClick(listing)}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${index === selectedIndex ? 'bg-blue-50' : ''
                                    }`}
                            >
                                {listing.images && listing.images[0] && (
                                    <img
                                        src={listing.images[0]}
                                        alt={listing.title}
                                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                        {listing.title}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {listing.description}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm font-semibold text-blue-600">
                                            ${(listing.currentBid || listing.startingPrice).toFixed(2)}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.status === 'LIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {listing.status}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* View all results */}
                    <button
                        onClick={() => handleSearch()}
                        className="w-full px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-200 transition-colors"
                    >
                        View all results for "{searchTerm}"
                    </button>
                </div>
            )}

            {/* No results message */}
            {showSuggestions && !loading && debouncedSearchTerm && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <p className="text-gray-500 text-center">No results found for "{debouncedSearchTerm}"</p>
                    <button
                        onClick={() => handleSearch()}
                        className="w-full mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                        Search anyway
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchWithSuggestions;
