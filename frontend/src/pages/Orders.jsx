import { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, CheckCircle, Truck, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api.service';
import API_CONFIG from '../config/api.config';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Orders = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        totalSpent: 0
    });

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PAYMENTS}/my-payments`, {
                params: { type: 'purchases' }
            });

            const payments = response.data.payments || [];
            setOrders(payments);

            // Calculate stats
            const completed = payments.filter(p => p.status === 'succeeded').length;
            const totalSpent = payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0);

            setStats({
                total: payments.length,
                completed,
                totalSpent
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            succeeded: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">View your purchase history and order details</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium mb-1">Total Spent</p>
                                <p className="text-3xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600 mb-6">Start bidding on auctions to see your orders here</p>
                            <Link
                                to="/listings"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Browse Auctions
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-6">
                                        {/* Image */}
                                        <Link to={`/listings/${order.listing.id}`} className="flex-shrink-0">
                                            <img
                                                src={order.listing.images?.[0] || '/placeholder.jpg'}
                                                alt={order.listing.title}
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                        </Link>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/listings/${order.listing.id}`}
                                                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                                                    >
                                                        {order.listing.title}
                                                    </Link>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Order ID: {order.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-600">Amount:</span>
                                                    <span className="font-bold text-gray-900">${order.amount.toFixed(2)}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-600">Ordered:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {order.paidAt && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span className="text-gray-600">Paid:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(order.paidAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/listings/${order.listing.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Listing
                                                </Link>

                                                {order.status === 'succeeded' && (
                                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                                        <Truck className="w-4 h-4" />
                                                        <span className="font-medium">Order Completed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
                    <p className="text-blue-700 text-sm">
                        If you have any questions about your orders or need assistance, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Orders;
