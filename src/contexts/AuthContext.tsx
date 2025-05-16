
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { masterExists, verifyMaster, initializeMaster } from '../services/database';

interface AuthContextType {
  isAuthenticated: boolean;
  masterKey: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  initialize: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if master password is set up
    const checkMaster = async () => {
      try {
        const initialized = await masterExists();
        setIsInitialized(initialized);
      } catch (error) {
        console.error('Error checking master password:', error);
        toast.error('Failed to check master password setup');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkMaster();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const isValid = await verifyMaster(password);
      
      if (isValid) {
        setIsAuthenticated(true);
        setMasterKey(password); // Store the actual master key for encryption/decryption
        toast.success('Login successful!');
        return true;
      } else {
        toast.error('Invalid master password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMasterKey(null);
    toast.info('Logged out successfully');
  };

  const initialize = async (password: string): Promise<boolean> => {
    try {
      await initializeMaster(password);
      setIsInitialized(true);
      toast.success('Master password created successfully');
      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error('Failed to create master password');
      return false;
    }
  };

  const value = {
    isAuthenticated,
    masterKey,
    isLoading,
    isInitialized,
    login,
    logout,
    initialize
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
