
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const { login, isInitialized, initialize } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
  };

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    
    if (initialize(newPassword)) {
      setIsCreating(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!isInitialized) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Lock className="h-5 w-5" /> Create Master Password
          </CardTitle>
          <CardDescription className="text-center">
            Set up your master password to protect your vault
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleInitialize}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  id="new-password"
                  type="password"
                  placeholder="New Master Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Master Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-vault-accent hover:bg-vault-accent/90">
              Create Master Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Lock className="h-5 w-5" /> SafeKeep Vault
        </CardTitle>
        <CardDescription className="text-center">
          Enter your master password to unlock the vault
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                id="password"
                type="password"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-vault-accent hover:bg-vault-accent/90">
            Unlock
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
