import { X, Home, LayoutDashboard, User, LogOut, Package } from "lucide-react";
import { Link } from "react-router-dom";

const MobileMenu = ({ isOpen, onClose, user, onLogout }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg lg:hidden transform transition-transform">
                <div className="p-4 border-b flex justify-between items-center">
                    <span className="text-xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>Auction
                    </span>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link 
                                to="/" 
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
                                onClick={onClose}
                            >
                                <Home size={20} />
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/listings" 
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium"
                                onClick={onClose}
                            >
                                <Package size={20} />
                                Browse Auctions
                            </Link>
                        </li>
                        {user && (
                            <>
                                <li>
                                    <Link 
                                        to="/listings/create" 
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-blue-600"
                                        onClick={onClose}
                                    >
                                        <Package size={20} />
                                        Create Listing
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/dashboard" 
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
                                        onClick={onClose}
                                    >
                                        <LayoutDashboard size={20} />
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/profile" 
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
                                        onClick={onClose}
                                    >
                                        <User size={20} />
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => {
                                            onLogout();
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-red-600"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                        {!user && (
                            <li>
                                <Link 
                                    to="/login" 
                                    className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    onClick={onClose}
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default MobileMenu;
