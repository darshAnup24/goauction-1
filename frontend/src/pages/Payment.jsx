import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import listingsService from '../services/listings.service';
import Loading from '../components/common/Loading';
import API_CONFIG from '../config/api.config';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SVSBzRzbAEw3lJruo2IX6RO0JTyVxXghOmK1SKgwvf8BrixjT8L8vvKU10dEkmVyMKa6IJhUKyRKwhEtauQ0lzw00WwGgWFZD');

const Payment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const listingId = searchParams.get('listing');

    useEffect(() => {
        if (!listingId) {
            toast.error('No listing specified');
            navigate('/');
            return;
        }
        fetchListing();
    }, [listingId]);

    const fetchListing = async () => {
        try {
            const response = await listingsService.getListingById(listingId);
            const data = response.listing || response;
            
            // Check if auction has ended (either status is ENDED or endTime has passed)
            const hasEnded = data.status === 'ENDED' || new Date(data.endTime) < new Date();
            
            if (!hasEnded) {
                toast.error('This auction has not ended yet');
                navigate(`/listings/${listingId}`);
                return;
            }

            setListing(data);
        } catch (error) {
            toast.error('Failed to load listing');
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            // Create checkout session
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/payments/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    listingId: listingId,
                    amount: listing.currentBid
                })
            });

            const session = await response.json();

            if (!session.success) {
                throw new Error(session.message || 'Failed to create payment session');
            }

            // Redirect to Stripe Checkout URL
            if (session.url) {
                window.location.href = session.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Failed to process payment');
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <Loading fullScreen />;
    }

    if (!listing) {
        return null;
    }

    const platformFee = listing.currentBid * 0.05;
    const totalAmount = listing.currentBid + platformFee;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">🎉 Congratulations!</h1>
                    <p className="text-gray-600 mt-2">You won this auction</p>
                </div>

                {/* Listing Details Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            <img
                                className="h-48 w-full md:w-48 object-cover"
                                src={listing.images?.[0] || 'https://via.placeholder.com/300'}
                                alt={listing.title}
                            />
                        </div>
                        <div className="p-6 flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{listing.title}</h2>
                            <p className="text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">Your Winning Bid</span>
                                <p className="text-3xl font-bold text-green-600">${listing.currentBid?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Winning bid</span>
                            <span>${listing.currentBid?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Platform fee (5%)</span>
                            <span>${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Your payment is processed securely through Stripe. We never store your card details.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Pay ${totalAmount.toFixed(2)} with Stripe
                            </span>
                        )}
                    </button>
                </div>

                {/* What's Next */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">What happens next?</h3>
                    <ol className="space-y-3">
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                            <span className="text-gray-600">Complete your secure payment via Stripe</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                            <span className="text-gray-600">You'll receive a payment confirmation email</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                            <span className="text-gray-600">The seller will be notified to ship your item</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                            <span className="text-gray-600">Track your order in the Orders section</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default Payment;
