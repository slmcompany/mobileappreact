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
  },

  // Pre Quote
  PRE_QUOTE: {
    COMBO: '/pre_quote/combo',
    CREATE: '/pre_quote',
    LIST: '/pre_quote',
    DETAIL: (id: string) => `/pre_quote/${id}`,
    UPDATE: (id: string) => `/pre_quote/${id}`,
    DELETE: (id: string) => `/pre_quote/${id}`
  },

  // Content
  CONTENT: {
    LIST: '/content',
    DETAIL: (id: string) => `/content/${id}`,
    CATEGORIES: '/content_category',
    BY_BRAND: (brand: string) => `/content?brand=${brand}`
  },

  // Sectors/Brands
  SECTOR: {
    LIST: '/sector',
    DETAIL: (id: string) => `/sector/${id}`,
    PRODUCTS: (id: string) => `/sector/${id}/products`
  },

  // Agents
  AGENTS: {
    LIST: '/agents',
    DETAIL: (id: string) => `/agents/${id}`,
    CREATE: '/agents',
    UPDATE: (id: string) => `/agents/${id}`,
    DELETE: (id: string) => `/agents/${id}`
  },

  // Customers
  CUSTOMERS: {
    LIST: '/customer',
    DETAIL: (id: string) => `/customer/${id}`,
    CREATE: '/customer',
    UPDATE: (id: string) => `/customer/${id}`,
    DELETE: (id: string) => `/customer/${id}`
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