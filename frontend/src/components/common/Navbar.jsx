import { Search, Menu, LogOut, User, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout: authLogout } = useAuth();
    
    const [search, setSearch] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await authLogout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('.user-dropdown')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/listings?search=${search}`);
        setIsSearchOpen(false);
    };

    return (
        <>
            <nav className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="mx-4 sm:mx-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto py-3 sm:py-4 transition-all">

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2"
                            aria-label="Open menu"
                        >
                            <Menu size={24} className="text-gray-700" />
                        </button>

                        {/* Logo */}
                        <Link to="/" className="relative text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-700">
                            <span className="text-green-600">go</span>Auction<span className="text-green-600 text-3xl sm:text-4xl lg:text-5xl leading-0">.</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-4 xl:gap-8 text-slate-600">
                            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
                            <Link to="/listings" className="hover:text-green-600 transition-colors font-medium">Browse Auctions</Link>
                            {user && (
                                <>
                                    <Link to="/listings/create" className="hover:text-green-600 transition-colors font-medium text-blue-600">Create Listing</Link>
                                    <Link to="/dashboard" className="hover:text-green-600 transition-colors">Dashboard</Link>
                                </>
                            )}
                            <Link to="/about" className="hover:text-green-600 transition-colors">About</Link>
                            <Link to="/contact" className="hover:text-green-600 transition-colors">Contact</Link>

                            <form onSubmit={handleSearch} className="hidden xl:flex items-center w-64 text-sm gap-2 bg-slate-100 px-4 py-2.5 rounded-full">
                                <Search size={18} className="text-slate-600" />
                                <input 
                                    className="w-full bg-transparent outline-none placeholder-slate-600" 
                                    type="text" 
                                    placeholder="Search auctions" 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                />
                            </form>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="lg:xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Search"
                            >
                                <Search size={20} className="text-gray-700" />
                            </button>

                            {user && <NotificationBell userId={user.id} />}

                            {user ? (
                                <div className="relative user-dropdown">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowUserMenu(!showUserMenu);
                                        }}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <User size={20} className="text-gray-700" />
                                        )}
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                                <User size={16} />
                                                Profile
                                            </Link>
                                            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600">
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search */}
                    {isSearchOpen && (
                        <form onSubmit={handleSearch} className="lg:xl:hidden pb-3">
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-full">
                                <Search size={18} className="text-slate-600" />
                                <input 
                                    className="w-full bg-transparent outline-none placeholder-slate-600 text-sm" 
                                    type="text" 
                                    placeholder="Search auctions" 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus 
                                />
                            </div>
                        </form>
                    )}
                </div>
            </nav>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} user={user} onLogout={handleLogout} />
        </>
    );
};

export default Navbar;
