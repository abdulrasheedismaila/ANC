import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('afnaan_admin_token') || sessionStorage.getItem('afnaan_admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async (): Promise<boolean> => {
    const savedToken = token || localStorage.getItem('afnaan_admin_token') || sessionStorage.getItem('afnaan_admin_token');
    if (!savedToken) {
      setAdmin(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }

    try {
      const res = await fetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
        setToken(savedToken);
        setIsLoading(false);
        return true;
      } else {
        localStorage.removeItem('afnaan_admin_token');
        sessionStorage.removeItem('afnaan_admin_token');
        setAdmin(null);
        setToken(null);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Failed to verify admin auth session:', err);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (newToken: string, newAdmin: AdminUser) => {
    setToken(newToken);
    setAdmin(newAdmin);
    sessionStorage.setItem('afnaan_admin_token', newToken);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        // ignore network error on logout
      }
    }
    localStorage.removeItem('afnaan_admin_token');
    sessionStorage.removeItem('afnaan_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
