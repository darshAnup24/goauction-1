import React from 'react';
import { Gavel, Users, Shield, TrendingUp, Award, Heart } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">About GoAuction</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        The premier online auction platform connecting buyers and sellers worldwide. 
                        Buy and sell anything, anytime, anywhere.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600 mb-4">
                            At GoAuction, we're revolutionizing the way people buy and sell online. Our mission is to create 
                            a transparent, secure, and exciting marketplace where everyone can participate in the thrill of auctions.
                        </p>
                        <p className="text-lg text-gray-600 mb-4">
                            Whether you're looking for rare collectibles, electronics, vehicles, or everyday items, 
                            GoAuction connects you with thousands of buyers and sellers in a trusted environment.
                        </p>
                        <p className="text-lg text-gray-600">
                            We believe in fair pricing, transparent bidding, and creating opportunities for everyone 
                            to find great deals and sell their items to the right buyers.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-100 rounded-lg p-6 text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                            <div className="text-gray-600">Active Users</div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-6 text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
                            <div className="text-gray-600">Auctions Completed</div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-6 text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
                            <div className="text-gray-600">Satisfaction Rate</div>
                        </div>
                        <div className="bg-yellow-100 rounded-lg p-6 text-center">
                            <div className="text-4xl font-bold text-yellow-600 mb-2">24/7</div>
                            <div className="text-gray-600">Support Available</div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-20">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose GoAuction?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Gavel className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Bidding</h3>
                            <p className="text-gray-600">
                                Experience the excitement of live auctions with instant bid updates and notifications.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                            <p className="text-gray-600">
                                All transactions are processed securely through Stripe with buyer protection.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted Community</h3>
                            <p className="text-gray-600">
                                Join thousands of verified buyers and sellers in our trusted marketplace.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Analytics</h3>
                            <p className="text-gray-600">
                                Track your auctions, bids, and sales with comprehensive dashboard analytics.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Assurance</h3>
                            <p className="text-gray-600">
                                Every listing is verified and monitored to ensure quality and authenticity.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Customer First</h3>
                            <p className="text-gray-600">
                                24/7 customer support ready to help you with any questions or concerns.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12 mb-20">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
                            <p className="text-gray-600">Create your free account in seconds</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Browse or List</h3>
                            <p className="text-gray-600">Find items to bid on or create your own listings</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Bid & Win</h3>
                            <p className="text-gray-600">Place bids and watch auctions in real-time</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                4
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Payment</h3>
                            <p className="text-gray-600">Complete purchase with secure checkout</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied users buying and selling on GoAuction today
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/register"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Get Started Free
                        </a>
                        <a
                            href="/listings"
                            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
                        >
                            Browse Auctions
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
