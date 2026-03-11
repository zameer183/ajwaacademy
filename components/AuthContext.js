'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/static-api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        }
      }
    } catch (error) {
      console.error('Auth init error:', error);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const data = response.data;
        
        // Store tokens (Supabase session)
        const accessToken = data?.session?.access_token || data?.access;
        const refreshToken = data?.session?.refresh_token || data?.refresh;
        try {
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
        } catch {}
        
        // Store user data
        const user = data?.user || data?.session?.user || {};
        const userData = {
          id: user.id,
          email: user.email || email,
          name: user.user_metadata?.name || user.name || 'Student',
          role: 'student' // default role
        };
        try {
          localStorage.setItem('userData', JSON.stringify(userData));
        } catch {}
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const data = response.data;
        
        // Store tokens (Supabase session)
        const accessToken = data?.session?.access_token || data?.access;
        const refreshToken = data?.session?.refresh_token || data?.refresh;
        try {
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
        } catch {}
        
        // Store user data
        const user = data?.user || data?.session?.user || {};
        const userObj = {
          id: user.id,
          email: user.email || userData.email,
          name: user.user_metadata?.name || user.name || userData.name,
          role: 'student' // default role
        };
        try {
          localStorage.setItem('userData', JSON.stringify(userObj));
        } catch {}
        
        setUser(userObj);
        return { success: true, user: userObj };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data regardless of API call result
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
      } catch {}
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
