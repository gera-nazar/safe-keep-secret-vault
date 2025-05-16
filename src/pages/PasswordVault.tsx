
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { PasswordEntry, searchVaultEntries } from '../services/vaultFile';
import VaultHeader from '../components/VaultHeader';
import PasswordList from '../components/PasswordList';
import { Lock } from 'lucide-react';

const PasswordVault: React.FC = () => {
  const { vaultData, masterKey } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([]);
  
  // Load passwords from vault
  useEffect(() => {
    if (vaultData) {
      try {
        setFilteredPasswords(vaultData.entries);
      } catch (error) {
        console.error('Error loading passwords:', error);
        toast.error('Failed to load passwords');
      } finally {
        setIsLoading(false);
      }
    }
  }, [vaultData]);
  
  const handleSearch = (query: string) => {
    if (!vaultData) return;
    
    try {
      const results = searchVaultEntries(vaultData, query);
      setFilteredPasswords(results);
    } catch (error) {
      console.error('Error searching passwords:', error);
      toast.error('Failed to search passwords');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-slow">
            <Lock className="h-12 w-12 mx-auto text-vault-accent mb-4" />
          </div>
          <h2 className="text-xl font-semibold">Loading your vault...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <VaultHeader />
      
      <main className="flex-grow container mx-auto py-6 px-4">
        <PasswordList
          passwords={filteredPasswords}
          onSearch={handleSearch}
        />
      </main>
    </div>
  );
};

export default PasswordVault;
