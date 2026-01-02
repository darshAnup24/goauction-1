import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, TrendingUp, Package, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Loading from '../components/common/Loading';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.data || response.data.notifications || []);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'BID_PLACED':
            case 'OUTBID':
                return <TrendingUp className="w-5 h-5" />;
            case 'AUCTION_WON':
            case 'AUCTION_ENDED':
                return <Package className="w-5 h-5" />;
            case 'PAYMENT_RECEIVED':
                return <DollarSign className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'BID_PLACED':
                return 'bg-blue-100 text-blue-600';
            case 'OUTBID':
                return 'bg-red-100 text-red-600';
            case 'AUCTION_WON':
                return 'bg-green-100 text-green-600';
            case 'PAYMENT_RECEIVED':
                return 'bg-yellow-100 text-yellow-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.isRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'all' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'unread' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-gray-600">
                            {filter === 'unread' 
                                ? 'All your notifications have been read' 
                                : 'We\'ll notify you when something important happens'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg ${
                                    !notification.isRead ? 'border-l-4 border-blue-500' : ''
                                }`}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                        getIconColor(notification.type)
                                    }`}>
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className={`text-gray-900 ${
                                                    !notification.isRead ? 'font-semibold' : ''
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Link */}
                                        {notification.link && (
                                            <Link
                                                to={notification.link}
                                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                                                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View details →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
