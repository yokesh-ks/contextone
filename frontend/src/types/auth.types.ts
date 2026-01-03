import { User } from './api.types';

// ============================================================================
// AUTH CONTEXT TYPES
// ============================================================================

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// AUTH GUARD TYPES
// ============================================================================

export interface AuthGuardProps {
  children: React.ReactNode;
}

export interface GuestGuardProps {
  children: React.ReactNode;
}

// ============================================================================
// TOKEN STORAGE TYPES
// ============================================================================

export interface TokenStorage {
  access_token: string;
  refresh_token: string;
  tenant_id: string;
}

export type StorageKey = keyof TokenStorage;
