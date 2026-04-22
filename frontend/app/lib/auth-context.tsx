'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { getProfile, logout as authLogout, User } from './auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al montar
  const refreshAuth = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cerrar sesión
  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    // Disparar evento para que el chatbot se reinicie
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }, []);

  // Verificar auth al montar
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Escuchar cambios de storage (para sincronizar entre pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_refresh') {
        refreshAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshAuth]);

  // Valor derivado memoizado (rerender-derived-state)
  // Regla 5.3: No envolver expresiones simples primitivas en useMemo
  const isAuthenticated = !!user;

  // useMemo para el value del contexto - evita re-renders innecesarios (rerender-memo)
  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated,
    refreshAuth,
    logout,
    setUser,
  }), [user, isLoading, isAuthenticated, refreshAuth, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper para disparar refresh en otras pestañas
export function triggerAuthRefresh() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_refresh', Date.now().toString());
    localStorage.removeItem('auth_refresh');
  }
}
