import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthService = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  connectWallet: async (walletAddress: string) => {
    const response = await api.post('/auth/wallet/connect', {
      walletAddress
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const SubscriptionService = {
  createPaymentSession: async (planType: 'premium' | 'test') => {
    const response = await api.post('/subscription/payment-session', {
      planType
    });
    return response.data;
  },

  verifyPayment: async (sessionId: string) => {
    const response = await api.get(`/subscription/payment-session/${sessionId}/verify`);
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post('/subscription/cancel');
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/subscription/status');
    return response.data;
  }
};

export const TokenService = {
  getTokens: async (params: {
    range?: string;
    source?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/tokens/list', { params });
    return response.data;
  },

  searchTokens: async (query: string, source?: string) => {
    const response = await api.get('/tokens/search', {
      params: { query, source }
    });
    return response.data;
  },

  getTokenDetails: async (symbol: string, source?: string) => {
    const response = await api.get(`/tokens/${symbol}/${source || ''}`);
    return response.data;
  },

  toggleFavorite: async (symbol: string, source?: string) => {
    const response = await api.post('/tokens/favorites', {
      symbol,
      source
    });
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/tokens/favorites');
    return response.data;
  },

  getSignals: async (strategy?: string) => {
    const response = await api.get('/tokens/signals', {
      params: { strategy }
    });
    return response.data;
  }
};

export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server';
  } else {
    // Error setting up request
    return 'Error making request';
  }
};

export default api;