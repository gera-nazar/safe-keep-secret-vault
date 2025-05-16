
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { VaultFile } from '../services/vaultFile';

interface AuthContextType {
  isAuthenticated: boolean;
  masterKey: string | null;
  isLoading: boolean;
  vaultData: VaultFile | null;
  vaultName: string | null;
  loadVault: (vault: VaultFile, password: string, filename?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vaultData, setVaultData] = useState<VaultFile | null>(null);
  const [vaultName, setVaultName] = useState<string | null>(null);

  const loadVault = async (vault: VaultFile, password: string, filename?: string): Promise<boolean> => {
    try {
      // Validate the vault structure
      if (!vault.metadata || !Array.isArray(vault.entries)) {
        toast.error('Invalid vault file structure');
        return false;
      }
      
      setVaultData(vault);
      setMasterKey(password);
      setIsAuthenticated(true);
      
      // Set the vault name from filename or metadata
      if (filename) {
        setVaultName(filename);
      } else if (vault.metadata.name) {
        setVaultName(vault.metadata.name);
      } else {
        setVaultName('Unnamed Vault');
      }
      
      return true;
    } catch (error) {
      console.error('Error loading vault:', error);
      toast.error('Failed to load vault');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMasterKey(null);
    setVaultData(null);
    setVaultName(null);
    toast.info('Logged out successfully');
  };

  const value = {
    isAuthenticated,
    masterKey,
    isLoading,
    vaultData,
    vaultName,
    loadVault,
    logout
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
