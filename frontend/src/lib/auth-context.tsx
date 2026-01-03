import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { type AxiosError } from 'axios';
import { authAPI } from './api';
import type { User, AuthContextValue, AuthResult } from '@/types';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

interface ApiErrorResponse {
  detail: string;
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log('AuthProvider render');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('tenant_id');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { access_token, refresh_token, tenant_id } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('tenant_id', tenant_id);
      await checkAuth();
      return { success: true };
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.detail || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, [checkAuth]);

  const signup = useCallback(async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> => {
    try {
      setError(null);
      const response = await authAPI.signup({
        email,
        password,
        full_name: fullName,
      });
      const { access_token, refresh_token, tenant_id } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('tenant_id', tenant_id);
      await checkAuth();
      return { success: true };
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.detail || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    }
  }, [checkAuth]);

  const logout = useCallback((): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('tenant_id');
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      // Get Google OAuth URL from backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/google`);
      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Failed to initiate Google OAuth:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    loginWithGoogle,
  }), [user, loading, error, login, signup, logout, checkAuth, loginWithGoogle]);

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
