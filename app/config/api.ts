// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://id.slmsolar.com/api',
  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000, // 30 seconds
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    SEARCH: '/products/search',
    HEALTHCHECK: '/products/healthcheck'
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    PRODUCTS: (id: string) => `/categories/${id}/products`
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`
  },
  
  // Users
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    ORDERS: '/users/orders',
    FAVORITES: '/users/favorites'
  },
  
  // Authentication
  AUTH: {
    LOGIN: '/users',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  }
};

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// API Request Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// API Helper Functions
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  return url.toString();
};

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      code: error.response.status.toString(),
      message: error.response.data.message || 'An error occurred',
      details: error.response.data
    };
  }
  
  return {
    code: '500',
    message: error.message || 'An unexpected error occurred',
    details: error
  };
};

// Default export
export default {
  API_CONFIG,
  API_ENDPOINTS,
  buildUrl,
  handleApiError
}; 