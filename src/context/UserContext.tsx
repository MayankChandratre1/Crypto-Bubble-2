import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService, handleApiError } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  subscription: {
    status: 'Free' | 'Premium';
    expiryDate?: string;
  };
  favorites: string[];
  walletAddress?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { user } = await AuthService.getProfile();
      setUser(user);
    } catch (error) {
      localStorage.removeItem('token');
      setError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { user, token } = await AuthService.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      setError(handleApiError(error));
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null);
      const { user, token } = await AuthService.register(username, email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      setError(handleApiError(error));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const connectWallet = async (address: string) => {
    try {
      setError(null);
      const { user } = await AuthService.connectWallet(address);
      setUser(user);
    } catch (error) {
      setError(handleApiError(error));
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        login, 
        register, 
        logout, 
        connectWallet,
        updateUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};