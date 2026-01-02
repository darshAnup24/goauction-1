import apiClient from './api.service';
import API_CONFIG from '../config/api.config';

const authService = {
  // Login
  async login(credentials) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register
  async register(userData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
    // If token is returned, auto-login the user
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  async logout() {
    await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verify email
  async verifyEmail(token) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VERIFY_EMAIL, { token });
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ME);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // Reset password
  async resetPassword(token, password) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, { token, password });
    return response.data;
  },

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('token');
  },

  // Check if authenticated
  isAuthenticated() {
    return !!this.getStoredToken();
  }
};

export default authService;
