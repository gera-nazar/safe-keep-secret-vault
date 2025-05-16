
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { decryptVaultFile } from '../services/vaultFile';

const FileUpload: React.FC = () => {
  const { loadVault } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [password, setPassword] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileRef.current?.files || fileRef.current.files.length === 0) {
      toast.error('Please select a vault file');
      return;
    }
    
    if (!password) {
      toast.error('Please enter your master password');
      return;
    }
    
    const file = fileRef.current.files[0];
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      
      const fileLoadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        
        reader.onerror = () => reject(reader.error);
      });
      
      reader.readAsText(file);
      
      const fileContent = await fileLoadPromise;
      const vaultData = await decryptVaultFile(fileContent, password);
      
      if (!vaultData) {
        toast.error('Invalid vault file or incorrect password');
        return;
      }
      
      // Pass the loaded vault and master password to auth context
      const success = await loadVault(vaultData, password, file.name);
      
      if (success) {
        toast.success('Vault unlocked successfully');
      }
    } catch (error) {
      console.error('Error processing vault file:', error);
      toast.error('Failed to process vault file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileRef.current?.click();
  };
  
  return (
    <form onSubmit={handleUpload} className="space-y-6">
      <div className="space-y-2">
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleButtonClick}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <div className="text-xl font-semibold mb-2">Upload Vault File</div>
          <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
          
          {fileName && (
            <div className="mt-2 flex items-center justify-center text-sm">
              <Lock className="h-4 w-4 mr-2 text-vault-accent" />
              <span className="font-medium">{fileName}</span>
            </div>
          )}
          
          <Input
            ref={fileRef}
            id="vault-file"
            type="file"
            accept=".vault"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="master-password">Master Password</Label>
        <Input
          id="master-password"
          type="password"
          placeholder="Enter your master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-vault-accent hover:bg-vault-accent/90"
        disabled={isUploading || !fileName || !password}
      >
        {isUploading ? 'Unlocking...' : 'Unlock Vault'}
      </Button>
    </form>
  );
};

export default FileUpload;
