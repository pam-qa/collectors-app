import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { AuthResponse, ApiResponse } from '../types';

// Get API URL from environment variable or use proxy in development
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      username,
      password,
    });
    if (response.data.data) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data!;
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      username,
      email,
      password,
    });
    if (response.data.data) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data!;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getMe: async () => {
    const response = await api.get('/me');
    return response.data.data;
  },
};

// ===== Cards API =====
export const cardsApi = {
  getAll: async (params?: AxiosRequestConfig['params']) => {
    const response = await api.get('/cards', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/cards/${id}`);
    return response.data.data;
  },

  search: async (query: string, params?: AxiosRequestConfig['params']) => {
    const response = await api.get('/cards/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },
};

// ===== Packs API =====
export const packsApi = {
  getAll: async (params?: AxiosRequestConfig['params']) => {
    const response = await api.get('/packs', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/packs/${id}`);
    return response.data.data;
  },
};

// ===== Collections API =====
export const collectionsApi = {
  getAll: async () => {
    const response = await api.get('/collections');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; description?: string }) => {
    const response = await api.post('/collections', data);
    return response.data.data;
  },

  update: async (id: string, data: { name?: string; description?: string }) => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/collections/${id}`);
  },

  addCard: async (collectionId: string, cardData: Record<string, unknown>) => {
    const response = await api.post(`/collections/${collectionId}/cards`, cardData);
    return response.data.data;
  },

  removeCard: async (collectionId: string, cardId: string) => {
    await api.delete(`/collections/${collectionId}/cards/${cardId}`);
  },
};

// ===== Decks API =====
export const decksApi = {
  getAll: async () => {
    const response = await api.get('/decks');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/decks/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; description?: string; format?: string }) => {
    const response = await api.post('/decks', data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; format?: string }
  ) => {
    const response = await api.put(`/decks/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/decks/${id}`);
  },

  addCard: async (deckId: string, cardData: Record<string, unknown>) => {
    const response = await api.post(`/decks/${deckId}/cards`, cardData);
    return response.data.data;
  },

  removeCard: async (deckId: string, cardId: string) => {
    await api.delete(`/decks/${deckId}/cards/${cardId}`);
  },
};

// ===== Wishlist API =====
export const wishlistApi = {
  getAll: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  add: async (cardId: string, alertData?: Record<string, unknown>) => {
    const response = await api.post('/wishlist', { card_id: cardId, ...alertData });
    return response.data.data;
  },

  remove: async (cardId: string) => {
    await api.delete(`/wishlist/${cardId}`);
  },
};

export default api;

