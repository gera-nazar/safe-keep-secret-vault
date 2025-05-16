
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { passwordsDB, PasswordEntry } from '../services/database';
import VaultHeader from '../components/VaultHeader';
import PasswordList from '../components/PasswordList';
import PasswordForm from '../components/PasswordForm';
import { Lock } from 'lucide-react'; // Import Lock from lucide-react

const PasswordVault: React.FC = () => {
  const { masterKey } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [currentEntry, setCurrentEntry] = useState<PasswordEntry | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([]);
  
  // Load passwords
  useEffect(() => {
    const loadPasswords = async () => {
      if (masterKey) {
        try {
          const allPasswords = await passwordsDB.getAll(masterKey);
          setPasswords(allPasswords);
          setFilteredPasswords(allPasswords);
        } catch (error) {
          console.error('Error loading passwords:', error);
          toast.error('Failed to load passwords');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadPasswords();
  }, [masterKey]);
  
  const handleAddNew = () => {
    setEditMode('add');
    setCurrentEntry(undefined);
    setFormOpen(true);
  };
  
  const handleEdit = (entry: PasswordEntry) => {
    setEditMode('edit');
    setCurrentEntry(entry);
    setFormOpen(true);
  };
  
  const handleDelete = async (id: number) => {
    try {
      const success = await passwordsDB.delete(id);
      if (success) {
        setPasswords(prev => prev.filter(entry => entry.id !== id));
        setFilteredPasswords(prev => prev.filter(entry => entry.id !== id));
        toast.success('Password deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting password:', error);
      toast.error('Failed to delete password');
    }
  };
  
  const handleFormSubmit = async (entry: PasswordEntry) => {
    if (!masterKey) return;
    
    try {
      if (editMode === 'add') {
        const newId = await passwordsDB.create(entry, masterKey);
        const newEntry = { ...entry, id: newId };
        setPasswords(prev => [...prev, newEntry]);
        setFilteredPasswords(prev => [...prev, newEntry]);
        toast.success('Password added successfully');
      } else {
        const success = await passwordsDB.update(entry, masterKey);
        if (success) {
          setPasswords(prev => 
            prev.map(item => (item.id === entry.id ? entry : item))
          );
          setFilteredPasswords(prev => 
            prev.map(item => (item.id === entry.id ? entry : item))
          );
          toast.success('Password updated successfully');
        }
      }
    } catch (error) {
      console.error('Error saving password:', error);
      toast.error(`Failed to ${editMode === 'add' ? 'add' : 'update'} password`);
    }
  };
  
  const handleSearch = async (query: string) => {
    if (!masterKey) return;
    
    if (!query.trim()) {
      setFilteredPasswords(passwords);
      return;
    }
    
    try {
      const results = await passwordsDB.search(query, masterKey);
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
      <VaultHeader onAddNew={handleAddNew} />
      
      <main className="flex-grow container mx-auto py-6 px-4">
        <PasswordList
          passwords={filteredPasswords}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearch={handleSearch}
        />
      </main>
      
      <PasswordForm
        open={formOpen}
        setOpen={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={currentEntry}
        mode={editMode}
      />
    </div>
  );
};

export default PasswordVault;
