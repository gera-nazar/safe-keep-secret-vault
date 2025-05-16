
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Lock, File } from 'lucide-react';

interface VaultHeaderProps {
  onAddNew?: () => void;
}

const VaultHeader: React.FC<VaultHeaderProps> = ({ onAddNew }) => {
  const { logout, vaultName } = useAuth();

  return (
    <header className="border-b bg-vault-dark text-white py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Lock className="h-6 w-6 text-vault-accent" />
          <h1 className="text-xl font-bold">SafeKeep Vault</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {vaultName && (
            <div className="flex items-center text-sm">
              <File className="h-4 w-4 mr-1 text-vault-accent" />
              <span className="max-w-[200px] truncate">{vaultName}</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={logout}
            className="border-vault-accent text-vault-accent hover:bg-vault-accent/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default VaultHeader;
