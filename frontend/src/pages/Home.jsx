import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Welcome to <span className="text-green-200">GoAuction</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-green-100">
                            Your premier online auction platform for buying and selling unique items
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/listings" className="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold text-lg">
                                Browse Auctions
                            </Link>
                            {isAuthenticated ? (
                                <Link to="/listings/create" className="px-8 py-4 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors font-semibold text-lg">
                                    Create Listing
                                </Link>
                            ) : (
                                <Link to="/register" className="px-8 py-4 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors font-semibold text-lg">
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose GoAuction?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card text-center">
                            <div className="text-green-600 text-4xl mb-4">🏆</div>
                            <h3 className="text-xl font-semibold mb-3">Competitive Bidding</h3>
                            <p className="text-gray-600">Real-time bidding with instant updates and notifications</p>
                        </div>
                        <div className="card text-center">
                            <div className="text-green-600 text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                            <p className="text-gray-600">Safe and secure payment processing with Stripe</p>
                        </div>
                        <div className="card text-center">
                            <div className="text-green-600 text-4xl mb-4">⚡</div>
                            <h3 className="text-xl font-semibold mb-3">Fast & Easy</h3>
                            <p className="text-gray-600">List items quickly and start selling in minutes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container-custom text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {isAuthenticated ? 'Start Selling Today' : 'Ready to Start?'}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {isAuthenticated 
                            ? 'Create your first listing and reach thousands of buyers' 
                            : 'Join thousands of users buying and selling on GoAuction'}
                    </p>
                    {isAuthenticated ? (
                        <Link to="/listings/create" className="btn-primary text-lg">
                            Create a Listing
                        </Link>
                    ) : (
                        <Link to="/register" className="btn-primary text-lg">
                            Create Your Account
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
