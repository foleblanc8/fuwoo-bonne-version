// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'client' | 'prestataire';
  has_provider_profile: boolean;
  phone_number?: string;
  address?: string;
  profile_picture?: string | null;
  bio?: string;
  is_verified?: boolean;
  email_verified?: boolean;
  rating?: number;
  total_reviews?: number;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: 'client' | 'prestataire';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Intercepteurs axios : injection du token Bearer + refresh automatique sur 401
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem('access_token');
      config.headers = config.headers ?? {};
      if (t) {
        config.headers['Authorization'] = `Bearer ${t}`;
      } else {
        delete config.headers['Authorization'];
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('auth/')
        ) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refresh_token');
          // Supprime le token expiré pour que le refresh parte sans Authorization
          localStorage.removeItem('access_token');
          if (refreshToken) {
            try {
              const res = await axios.post<{ access: string }>(
                'auth/token/refresh/',
                { refresh: refreshToken },
              );
              const newAccess = res.data.access;
              localStorage.setItem('access_token', newAccess);
              return axios(originalRequest);
            } catch {
              // Refresh échoué → déconnexion + relance sans token (endpoints publics)
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              return axios(originalRequest);
            }
          } else {
            // Pas de refresh token → relance sans token
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
  }

  const login = async (username: string, password: string) => {
    const response = await axios.post<AuthResponse>('auth/login/', { username, password });
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
  };

  const loginWithGoogle = async (accessToken: string) => {
    const response = await axios.post<AuthResponse>('auth/google/', { access_token: accessToken });
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const response = await axios.post<AuthResponse>('auth/register/', data);
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const resendVerification = async () => {
    await axios.post('auth/resend-verification/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
