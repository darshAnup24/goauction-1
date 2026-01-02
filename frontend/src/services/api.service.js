import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });

    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      // Only redirect on token expired/invalid, not on login failures
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
        console.log('🔒 Session expired, redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
