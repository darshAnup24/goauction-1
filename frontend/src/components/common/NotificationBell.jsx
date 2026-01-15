import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import socketService from "../../services/socket.service";
import notificationsService from "../../services/notifications.service";
import API_CONFIG from "../../config/api.config";
import apiClient from "../../services/api.service";

const NotificationBell = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchNotifications();

            // Connect socket and listen for new notifications
            socketService.onNotification((notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            socketService.off('notification');
        };
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationsService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} className="text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto">
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        <Link
                            to="/notifications"
                            className="text-sm text-green-600 hover:text-green-700"
                            onClick={() => setShowDropdown(false)}
                        >
                            View All
                        </Link>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.slice(0, 5).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-green-50' : ''}`}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <p className="text-sm">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
