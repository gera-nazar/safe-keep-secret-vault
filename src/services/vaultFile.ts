
import CryptoJS from 'crypto-js';
import { encryptData, decryptData } from './encryption';

export interface VaultFile {
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    name?: string;
  };
  entries: PasswordEntry[];
}

export interface PasswordEntry {
  id?: number;
  site_name: string;
  site_url?: string;
  username: string;
  password: string;
  created_at?: string;
  modified_at?: string;
  notes?: string;
}

// Parse and decrypt vault file content
export async function decryptVaultFile(fileContent: string, masterPassword: string): Promise<VaultFile | null> {
  try {
    const decrypted = decryptData(fileContent, masterPassword);
    const vaultData = JSON.parse(decrypted);
    
    // Validate expected structure
    if (!vaultData.metadata || !Array.isArray(vaultData.entries)) {
      throw new Error('Invalid vault file structure');
    }
    
    return vaultData;
  } catch (error) {
    console.error('Failed to decrypt vault file:', error);
    return null;
  }
}

// Encrypt vault data to string
export function encryptVaultFile(vaultData: VaultFile, masterPassword: string): string {
  try {
    const jsonData = JSON.stringify(vaultData);
    return encryptData(jsonData, masterPassword);
  } catch (error) {
    console.error('Failed to encrypt vault data:', error);
    throw error;
  }
}

// Create an empty vault structure
export function createEmptyVault(name?: string): VaultFile {
  const now = new Date().toISOString();
  return {
    metadata: {
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      name: name || 'My Password Vault'
    },
    entries: []
  };
}

// Search within vault entries
export function searchVaultEntries(vault: VaultFile, query: string): PasswordEntry[] {
  if (!query.trim()) return vault.entries;
  
  const normalizedQuery = query.toLowerCase();
  
  return vault.entries.filter(entry => 
    entry.site_name.toLowerCase().includes(normalizedQuery) ||
    (entry.site_url && entry.site_url.toLowerCase().includes(normalizedQuery)) ||
    entry.username.toLowerCase().includes(normalizedQuery) ||
    (entry.notes && entry.notes.toLowerCase().includes(normalizedQuery))
  );
}
