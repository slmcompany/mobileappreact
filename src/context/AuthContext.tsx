import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AuthService from '@/src/services/AuthService';
import User, { AuthState, LoginCredentials } from '@/src/models/User';

// Create authentication context type
interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  getUser: () => Promise<User | null>;
  updateUser: (userInfo: {
    email?: string | null;
    address?: string;
    idNumber?: string;
    birthDate?: string;
    gender?: string;
  }) => Promise<User | null>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  authState: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  },
  login: async () => null,
  logout: async () => {},
  getUser: async () => null,
  updateUser: async () => null
});

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthService.isAuthenticated();
        
        if (isAuthenticated) {
          const user = await AuthService.getCurrentUser();
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error checking authentication'
        });
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      setAuthState({
        ...authState,
        isLoading: true,
        error: null
      });
      
      const user = await AuthService.login(credentials);
      
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return user;
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Invalid credentials'
        });
        return null;
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed'
      });
      return null;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState({
        ...authState,
        error: 'Logout failed'
      });
    }
  };

  // Get current user
  const getUser = async (): Promise<User | null> => {
    try {
      return await AuthService.getCurrentUser();
    } catch (error) {
      return null;
    }
  };

  // Update user information
  const updateUser = async (userInfo: {
    email?: string | null;
    address?: string;
    idNumber?: string;
    birthDate?: string;
    gender?: string;
  }): Promise<User | null> => {
    try {
      const updatedUser = await AuthService.updateUserProfile(userInfo);
      
      if (updatedUser) {
        setAuthState({
          ...authState,
          user: updatedUser
        });
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  };

  // Value object to be provided to consumers
  const value = {
    authState,
    login,
    logout,
    getUser,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 