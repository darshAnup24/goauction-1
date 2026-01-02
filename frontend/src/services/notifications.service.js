import apiClient from './api.service';
import API_CONFIG from '../config/api.config';

const notificationsService = {
  // Get user's notifications
  async getNotifications(params = {}) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS, { params });
    return response.data;
  },

  // Get unread notification count
  async getUnreadCount() {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/unread-count`);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id) {
    const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/mark-all-read`);
    return response.data;
  },

  // Delete notification
  async deleteNotification(id) {
    const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${id}`);
    return response.data;
  }
};

export default notificationsService;
