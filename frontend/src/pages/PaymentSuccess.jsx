import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Home, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const sessionId = searchParams.get('session_id');
    const listingId = searchParams.get('listing');

    useEffect(() => {
        if (!sessionId || !listingId) {
            toast.error('Invalid payment session');
            navigate('/');
            return;
        }

        // Countdown timer - redirect to Orders page
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/orders'); // Changed from /dashboard to /orders
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionId, listingId, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white rounded-full p-4 animate-bounce">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-green-100 text-lg">
                            Your payment has been processed successfully
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                                <CheckCircle className="w-4 h-4" />
                                Transaction Complete
                            </div>
                            <p className="text-gray-600 mb-2">
                                Thank you for your purchase! You will receive a confirmation email shortly.
                            </p>
                            <p className="text-sm text-gray-500">
                                Session ID: {sessionId?.slice(0, 20)}...
                            </p>
                        </div>

                        {/* What's Next */}
                        <div className="bg-blue-50 rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                What's Next?
                            </h2>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                                        1
                                    </div>
                                    <span>The seller has been notified of your payment</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                                        2
                                    </div>
                                    <span>You'll receive a confirmation email with payment details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                                        3
                                    </div>
                                    <span>The seller will prepare your item for delivery</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                                        4
                                    </div>
                                    <span>You can track your purchase in the dashboard</span>
                                </li>
                            </ul>
                        </div>

                        {/* Redirect Notice */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-500">
                                Redirecting to your orders in <span className="font-bold text-blue-600">{countdown}</span> seconds...
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/orders"
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                View My Orders
                            </Link>
                            <Link
                                to="/"
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Back to Home
                            </Link>
                        </div>

                        {/* Support */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Need help? Contact us at{' '}
                                <a href="mailto:support@goauction.com" className="text-blue-600 hover:underline">
                                    support@goauction.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Secured by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
