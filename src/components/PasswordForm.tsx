
import React, { useState } from 'react';
import { toast } from 'sonner';
import { PasswordEntry } from '../services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface PasswordFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (entry: PasswordEntry) => void;
  initialData?: PasswordEntry;
  mode: 'add' | 'edit';
}

const emptyEntry: PasswordEntry = {
  site_url: '',
  site_name: '',
  username: '',
  password: '',
  notes: ''
};

function generatePassword(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  open,
  setOpen,
  onSubmit,
  initialData,
  mode
}) => {
  const [entry, setEntry] = useState<PasswordEntry>(initialData || emptyEntry);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!entry.site_name.trim()) {
      toast.error('Site name is required');
      return;
    }
    
    if (!entry.password.trim()) {
      toast.error('Password is required');
      return;
    }
    
    onSubmit(entry);
    
    if (mode === 'add') {
      setEntry(emptyEntry);
    }
    
    setOpen(false);
  };
  
  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setEntry(prev => ({ ...prev, password: newPassword }));
    setShowPassword(true);
    toast.info('Password generated!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Password' : 'Edit Password'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="site_name" className="text-right">
                Site Name
              </Label>
              <Input
                id="site_name"
                name="site_name"
                value={entry.site_name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="site_url" className="text-right">
                URL
              </Label>
              <Input
                id="site_url"
                name="site_url"
                value={entry.site_url}
                onChange={handleChange}
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={entry.username}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={entry.password}
                    onChange={handleChange}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleGeneratePassword}>
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={entry.notes}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-vault-accent hover:bg-vault-accent/90">
              {mode === 'add' ? 'Add Password' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordForm;
