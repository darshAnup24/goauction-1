const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    ME: '/api/auth/me',

    // Listings
    LISTINGS: '/api/listings',
    LISTING_BY_ID: (id) => `/api/listings/${id}`,
    MY_LISTINGS: '/api/listings/user/my-listings',

    // Bids
    BIDS: '/api/bids',
    PLACE_BID: '/api/bids/place',
    BID_BY_ID: (id) => `/api/bids/${id}`,
    LISTING_BIDS: (listingId) => `/api/bids/listing/${listingId}`,
    MY_BIDS: '/api/bids/my-bids',
    BID_STATS: '/api/bids/stats',

    // Payments
    PAYMENTS: '/api/payments',
    CREATE_PAYMENT_INTENT: '/api/payments/create-intent',
    CONFIRM_PAYMENT: '/api/payments/confirm',

    // Users
    USERS: '/api/users',
    UPDATE_PROFILE: '/api/users/profile',
    UPLOAD_AVATAR: '/api/users/avatar',

    // Notifications
    NOTIFICATIONS: '/api/notifications',
    MARK_READ: '/api/notifications/mark-read',

    // Upload
    UPLOAD_IMAGE: '/api/upload/single',
    UPLOAD_MULTIPLE: '/api/upload/multiple',
    DELETE_IMAGE: '/api/upload',
    UPLOAD_VIDEO: '/api/upload/video',
    DELETE_VIDEO: '/api/upload/video',

    // Vendors
    CONNECT_STRIPE: '/api/vendors/connect-stripe',
    STRIPE_STATUS: '/api/vendors/stripe-status',
  }
};

export default API_CONFIG;
