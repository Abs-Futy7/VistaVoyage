// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      REGISTER: '/api/v1/auth/register',
      LOGOUT: '/api/v1/auth/logout',
      REFRESH: '/api/v1/auth/refresh',
      FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
      RESET_PASSWORD: '/api/v1/auth/reset-password',
      PROFILE: '/api/v1/auth/profile'
    },
    // User endpoints
    USERS: {
      BASE: '/api/v1/users',
      PROFILE: '/api/v1/users/profile',
      BOOKINGS: '/api/v1/users/bookings',
      WISHLIST: '/api/v1/users/wishlist'
    },
    // Package endpoints
    PACKAGES: {
      BASE: '/api/v1/packages',
      SEARCH: '/api/v1/packages/search',
      POPULAR: '/api/v1/packages/popular',
      BY_ID: (id: string) => `/api/v1/packages/${id}`
    },
    // Booking endpoints
    BOOKINGS: {
      BASE: '/api/v1/bookings',
      CREATE: '/api/v1/bookings',
      BY_ID: (id: string) => `/api/v1/bookings/${id}`,
      CANCEL: (id: string) => `/api/v1/bookings/${id}/cancel`
    },
    // Blog endpoints
    BLOGS: {
      BASE: '/api/v1/blogs',
      BY_ID: (id: string) => `/api/v1/blogs/${id}`,
      LATEST: '/api/v1/blogs/latest'
    },
    // Destination endpoints
    DESTINATIONS: {
      BASE: '/api/v1/destinations',
      POPULAR: '/api/v1/destinations/popular'
    },
    // Admin Authentication endpoints
    ADMIN_AUTH: {
      LOGIN: '/api/v1/admin/auth/login',
      LOGOUT: '/api/v1/admin/auth/logout',
      REFRESH: '/api/v1/admin/auth/refresh',
      ME: '/api/v1/admin/auth/me',
      CREATE: '/api/v1/admin/auth/create',
      CHANGE_PASSWORD: '/api/v1/admin/auth/change-password'
    },
    // Admin management endpoints
    ADMIN: {
      // Dashboard
      DASHBOARD_STATS: '/api/v1/admin/dashboard/stats',
      SYSTEM_STATS: '/api/v1/admin/system/stats',
      
      // Users
      USERS: '/api/v1/admin/users',
      USER_TOGGLE_STATUS: (id: string) => `/api/v1/admin/users/${id}/toggle-status`,
      USER_DELETE: (id: string) => `/api/v1/admin/users/${id}`,
      
      // Blogs
      BLOGS: '/api/v1/admin/blogs',
      BLOG_CREATE: '/api/v1/admin/blogs',
      BLOG_UPDATE: (id: string) => `/api/v1/admin/blogs/${id}`,
      BLOG_DELETE: (id: string) => `/api/v1/admin/blogs/${id}`,
      BLOG_TOGGLE_PUBLISH: (id: string) => `/api/v1/admin/blogs/${id}/toggle-publish`,
      BLOG_UPLOAD_IMAGE: '/api/v1/admin/blogs/upload-image',
      
      // Packages
      PACKAGES: '/api/v1/admin/packages',
      PACKAGE_STATS: '/api/v1/admin/packages/stats',
      PACKAGE_CREATE: '/api/v1/admin/packages',
      PACKAGE_DETAILS: (id: string) => `/api/v1/admin/packages/${id}`,
      PACKAGE_UPDATE: (id: string) => `/api/v1/admin/packages/${id}`,
      PACKAGE_DELETE: (id: string) => `/api/v1/admin/packages/${id}`,
      PACKAGE_TOGGLE_ACTIVE: (id: string) => `/api/v1/admin/packages/${id}/toggle-active`,
      PACKAGE_UPLOAD_IMAGE: '/api/v1/admin/packages/upload-image',
      
      // Bookings
      BOOKINGS: '/api/v1/admin/bookings',
      BOOKING_DETAILS: (id: string) => `/api/v1/admin/bookings/${id}`,
      BOOKING_UPDATE_STATUS: (id: string) => `/api/v1/admin/bookings/${id}/status`,
      
      // Destinations
      DESTINATIONS: '/api/v1/admin/destinations',
      DESTINATION_CREATE: '/api/v1/admin/destinations',
      DESTINATION_DETAILS: (id: string) => `/api/v1/admin/destinations/${id}`,
      DESTINATION_DETAILS_FULL: (id: string) => `/api/v1/admin/destinations/${id}/details`,
      DESTINATION_UPDATE: (id: string) => `/api/v1/admin/destinations/${id}`,
      DESTINATION_DELETE: (id: string) => `/api/v1/admin/destinations/${id}`,
      DESTINATION_UPLOAD_IMAGE: '/api/v1/admin/destinations/upload-image',
      
      // Trip Types
      TRIP_TYPES: '/api/v1/admin/trip-types',
      TRIP_TYPE_CREATE: '/api/v1/admin/trip-types',
      TRIP_TYPE_UPDATE: (id: string) => `/api/v1/admin/trip-types/${id}`,
      TRIP_TYPE_DELETE: (id: string) => `/api/v1/admin/trip-types/${id}`,
      
      // Activities
      ACTIVITIES: '/api/v1/admin/activities',
      ACTIVITY_CREATE: '/api/v1/admin/activities',
      ACTIVITY_UPDATE: (id: string) => `/api/v1/admin/activities/${id}`,
      ACTIVITY_DELETE: (id: string) => `/api/v1/admin/activities/${id}`,
      ACTIVITY_UPLOAD_IMAGE: '/api/v1/admin/activities/upload-image',
      ACTIVITY_DETAILS: (id: string) => `/api/v1/admin/activities/${id}/details`,
      
      // Offers
      OFFERS: '/api/v1/admin/offers',
      OFFER_CREATE: '/api/v1/admin/offers',
      OFFER_UPDATE: (id: string) => `/api/v1/admin/offers/${id}`,
      OFFER_DELETE: (id: string) => `/api/v1/admin/offers/${id}`,
      OFFER_TOGGLE_ACTIVE: (id: string) => `/api/v1/admin/offers/${id}/toggle-active`,
      
      // Promo Codes
      PROMO_CODES: '/api/v1/admin/promo-codes',
      PROMO_CODE_CREATE: '/api/v1/admin/promo-codes',
      PROMO_CODE_UPDATE: (id: string) => `/api/v1/admin/promo-codes/${id}`,
      PROMO_CODE_DELETE: (id: string) => `/api/v1/admin/promo-codes/${id}`,
      PROMO_CODE_TOGGLE_ACTIVE: (id: string) => `/api/v1/admin/promo-codes/${id}/toggle-active`,
      
      // Storage
      SETUP_STORAGE: '/api/v1/admin/setup-storage'
    },
    // User API endpoints (authenticated user routes)
    USER_API: {
      PACKAGES: {
        BASE: '/api/v1/user/packages',
        FEATURED: '/api/v1/user/packages/featured',
        BY_ID: (id: string) => `/api/v1/user/packages/${id}`,
        SEARCH: '/api/v1/user/packages/search',
      },
      BOOKINGS: {
        BASE: '/api/v1/user/bookings',
        BY_ID: (id: string) => `/api/v1/user/bookings/${id}`,
        CREATE: '/api/v1/user/bookings',
        CANCEL: (id: string) => `/api/v1/user/bookings/${id}/cancel`,
        PAYMENT: (id: string) => `/api/v1/user/bookings/${id}/payment`,
      },
      DESTINATIONS: {
        BASE: '/api/v1/user/destinations',
        BY_ID: (id: string) => `/api/v1/user/destinations/${id}`,
      },
      ACTIVITIES: {
        BASE: '/api/v1/user/activities',
        BY_ID: (id: string) => `/api/v1/user/activities/${id}`,
      },
      OFFERS: {
        BASE: '/api/v1/user/offers',
        BY_ID: (id: string) => `/api/v1/user/offers/${id}`,
      },
      TRIP_TYPES: {
        BASE: '/api/v1/user/trip-types',
        BY_ID: (id: string) => `/api/v1/user/trip-types/${id}`,
      },
      PROMO_CODES: {
        BASE: '/api/v1/user/promo_codes',
        VALIDATE: '/api/v1/user/promo_codes/validate',
        BY_CODE: (code: string) => `/api/v1/user/promo_codes/code/${code}`,
      },
      BLOGS: {
        BASE: '/api/v1/user/blogs',
        BY_ID: (id: string) => `/api/v1/user/blogs/${id}`,
        MY_BLOGS: '/api/v1/user/my-blogs',
        MY_BLOG_BY_ID: (id: string) => `/api/v1/user/my-blogs/${id}`,
        CREATE: '/api/v1/user/my-blogs',
        UPDATE: (id: string) => `/api/v1/user/my-blogs/${id}`,
        DELETE: (id: string) => `/api/v1/user/my-blogs/${id}`,
        TOGGLE_PUBLISH: (id: string) => `/api/v1/user/my-blogs/${id}/publish`,
        FEATURED: '/api/v1/user/blogs/featured',
        RECENT: '/api/v1/user/blogs/recent',
        CATEGORIES: '/api/v1/user/blogs/categories',
      },
    }
  }
};

// Request timeout
export const REQUEST_TIMEOUT = 5000; // 5 seconds for faster feedback
