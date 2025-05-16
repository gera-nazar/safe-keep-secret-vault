
import { encryptData, decryptData } from './encryption';
export { encryptData, decryptData };

// Re-export VaultFile types and functions
export { 
  type VaultFile, 
  type PasswordEntry,
  decryptVaultFile,
  encryptVaultFile,
  createEmptyVault,
  searchVaultEntries
} from './vaultFile';
