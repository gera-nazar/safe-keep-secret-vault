
import CryptoJS from 'crypto-js';
import { executeTransaction, SETTINGS_STORE } from './databaseCore';

export const MASTER_KEY_SETTING = 'masterKey';

// Master password operations
export async function masterExists(): Promise<boolean> {
  try {
    const result = await executeTransaction<any>(
      SETTINGS_STORE,
      'readonly',
      (store) => store.get(MASTER_KEY_SETTING)
    );
    return !!result;
  } catch (error) {
    console.error('Error checking master password:', error);
    return false;
  }
}

export async function initializeMaster(password: string): Promise<void> {
  const hashedPassword = CryptoJS.SHA256(password).toString();
  const salt = CryptoJS.lib.WordArray.random(128/8).toString();
  
  const masterData = {
    key: MASTER_KEY_SETTING,
    hash: CryptoJS.PBKDF2(hashedPassword, salt, { 
      keySize: 512/32, 
      iterations: 1000 
    }).toString(),
    salt: salt
  };
  
  await executeTransaction(
    SETTINGS_STORE,
    'readwrite',
    (store) => store.put(masterData)
  );
}

export async function verifyMaster(password: string): Promise<boolean> {
  try {
    const masterData = await executeTransaction<any>(
      SETTINGS_STORE,
      'readonly',
      (store) => store.get(MASTER_KEY_SETTING)
    );
    
    if (!masterData) return false;
    
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const hash = CryptoJS.PBKDF2(hashedPassword, masterData.salt, { 
      keySize: 512/32, 
      iterations: 1000 
    }).toString();
    
    return hash === masterData.hash;
  } catch (error) {
    console.error('Error verifying master password:', error);
    return false;
  }
}
