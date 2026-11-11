import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPreferences } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      console.log('User not logged in or demo mode active');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password: pass, full_name: name });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    if (!user) return;
    try {
      const res = await api.updatePreferences(prefs);
      setUser({ ...user, preferences: res.preferences });
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

