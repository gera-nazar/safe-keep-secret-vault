
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Lock, Plus } from 'lucide-react';

interface VaultHeaderProps {
  onAddNew: () => void;
}

const VaultHeader: React.FC<VaultHeaderProps> = ({ onAddNew }) => {
  const { logout } = useAuth();

  return (
    <header className="border-b bg-vault-dark text-white py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Lock className="h-6 w-6 text-vault-accent" />
          <h1 className="text-xl font-bold">SafeKeep Vault</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onAddNew}
            className="bg-vault-accent hover:bg-vault-accent/90"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add New
          </Button>
          
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
