
import React from 'react';
import FileUpload from '../components/FileUpload';
import PasswordVault from './PasswordVault';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vault-dark flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-pulse-slow">
            <Lock className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-semibold">Loading SafeKeep...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {isAuthenticated ? (
        <PasswordVault />
      ) : (
        <div className="min-h-screen bg-vault-dark flex flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-3">
              <Lock className="h-12 w-12 text-vault-accent mr-2" />
              <h1 className="text-3xl font-bold text-white">SafeKeep</h1>
            </div>
            <p className="text-gray-300">Your secure password vault viewer</p>
            <p className="text-gray-400 text-sm mt-2">Upload your .vault file to access your passwords</p>
          </div>
          
          <div className="w-[350px]">
            <FileUpload />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
