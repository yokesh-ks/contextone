import { createClient } from '@supabase/supabase-js';
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  Project,
  Document,
  ApiKey,
  ChatResponse,
  Analytics,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  ChatRequest,
  CreateApiKeyRequest,
  FeedbackRequest,
  ChatMessage,
} from '@/types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Supabase client (for future direct DB access if needed)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// API client for backend
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extended config type for retry logic
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post<AuthResponse>(
            `${API_URL}/api/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('tenant_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  signup: (data: SignupRequest) =>
    api.post<AuthResponse>('/auth/signup', data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken }),

  getMe: () =>
    api.get<User>('/auth/me'),
};

// ============================================================================
// PROJECTS API
// ============================================================================

export const projectsAPI = {
  getAll: () =>
    api.get<Project[]>('/projects'),

  getOne: (projectId: string) =>
    api.get<Project>(`/projects/${projectId}`),

  create: (data: CreateProjectRequest) =>
    api.post<Project>('/projects', data),

  update: (projectId: string, data: UpdateProjectRequest) =>
    api.patch<Project>(`/projects/${projectId}`, data),

  delete: (projectId: string) =>
    api.delete(`/projects/${projectId}`),
};

// ============================================================================
// DOCUMENTS API
// ============================================================================

export const documentsAPI = {
  getAll: (projectId: string) =>
    api.get<Document[]>(`/projects/${projectId}/documents`),

  upload: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Document>(`/projects/${projectId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (projectId: string, docId: string) =>
    api.delete(`/projects/${projectId}/documents/${docId}`),
};

// ============================================================================
// CHAT API
// ============================================================================

export const chatAPI = {
  send: (projectId: string, query: string, conversationHistory: ChatMessage[] = []) =>
    api.post<ChatResponse>(`/projects/${projectId}/chat`, {
      query,
      conversation_history: conversationHistory,
    } as ChatRequest),
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsAPI = {
  get: (projectId: string) =>
    api.get<Analytics>(`/projects/${projectId}/analytics`),
};

// ============================================================================
// API KEYS API
// ============================================================================

export const apiKeysAPI = {
  getAll: () =>
    api.get<ApiKey[]>('/api-keys'),

  create: (name: string) =>
    api.post<ApiKey>('/api-keys', { name } as CreateApiKeyRequest),

  delete: (keyId: string) =>
    api.delete(`/api-keys/${keyId}`),
};

// ============================================================================
// FEEDBACK API
// ============================================================================

export const feedbackAPI = {
  submit: (data: FeedbackRequest) =>
    api.post('/feedback', data),
};

export default api;
