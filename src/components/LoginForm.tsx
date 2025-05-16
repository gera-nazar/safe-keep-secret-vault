
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const { loadVault } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Since we're now using vault files instead of login, this component might need 
    // to be refactored or removed in favor of the FileUpload component
    console.log("Login functionality replaced with vault file upload");
  };

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
