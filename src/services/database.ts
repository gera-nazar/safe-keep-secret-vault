
import CryptoJS from 'crypto-js';

// Mock database using IndexedDB for browser environment
const DB_NAME = 'safekeepVault';
const DB_VERSION = 1;
const PASSWORDS_STORE = 'passwords';
const SETTINGS_STORE = 'settings';
const MASTER_KEY_SETTING = 'masterKey';

// Interface for password entries
export interface PasswordEntry {
  id?: number;
  site_url: string;
  site_name: string;
  username: string;
  password: string; // Plain password (will be encrypted before storage)
  created_at?: string;
  modified_at?: string;
  notes: string;
}

// Encryption/decryption functions
export function encryptData(data: string, masterKey: string): string {
  return CryptoJS.AES.encrypt(data, masterKey).toString();
}

export function decryptData(encryptedData: string, masterKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Open IndexedDB connection
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open database'));

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(PASSWORDS_STORE)) {
        const passwordsStore = db.createObjectStore(PASSWORDS_STORE, { keyPath: 'id', autoIncrement: true });
        passwordsStore.createIndex('site_name', 'site_name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

// Wrapper for database operations
const executeTransaction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

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

// Password database operations
export const passwordsDB = {
  // Add new password entry
  create: async (entry: PasswordEntry, masterKey: string): Promise<number> => {
    const now = new Date().toISOString();
    const encryptedPassword = encryptData(entry.password, masterKey);
    
    const entryToStore = {
      site_url: entry.site_url,
      site_name: entry.site_name,
      username: entry.username,
      password_encrypted: encryptedPassword,
      created_at: now,
      modified_at: now,
      notes: entry.notes
    };
    
    return await executeTransaction<IDBValidKey>(
      PASSWORDS_STORE,
      'readwrite',
      (store) => store.add(entryToStore)
    ) as number;
  },
  
  // Get all password entries
  getAll: async (masterKey: string): Promise<PasswordEntry[]> => {
    const rows = await executeTransaction<any[]>(
      PASSWORDS_STORE,
      'readonly',
      (store) => store.getAll()
    );
    
    return rows.map(row => ({
      id: row.id,
      site_url: row.site_url,
      site_name: row.site_name,
      username: row.username,
      password: decryptData(row.password_encrypted, masterKey),
      created_at: row.created_at,
      modified_at: row.modified_at,
      notes: row.notes
    }));
  },
  
  // Get a specific password entry
  get: async (id: number, masterKey: string): Promise<PasswordEntry | null> => {
    const row = await executeTransaction<any>(
      PASSWORDS_STORE,
      'readonly',
      (store) => store.get(id)
    );
    
    if (!row) return null;
    
    return {
      id: row.id,
      site_url: row.site_url,
      site_name: row.site_name,
      username: row.username,
      password: decryptData(row.password_encrypted, masterKey),
      created_at: row.created_at,
      modified_at: row.modified_at,
      notes: row.notes
    };
  },
  
  // Update a password entry
  update: async (entry: PasswordEntry, masterKey: string): Promise<boolean> => {
    const id = entry.id;
    if (!id) return false;
    
    const existingEntry = await executeTransaction<any>(
      PASSWORDS_STORE,
      'readonly',
      (store) => store.get(id)
    );
    
    if (!existingEntry) return false;
    
    const now = new Date().toISOString();
    const encryptedPassword = encryptData(entry.password, masterKey);
    
    const updatedEntry = {
      ...existingEntry,
      site_url: entry.site_url,
      site_name: entry.site_name,
      username: entry.username,
      password_encrypted: encryptedPassword,
      modified_at: now,
      notes: entry.notes
    };
    
    await executeTransaction(
      PASSWORDS_STORE,
      'readwrite',
      (store) => store.put(updatedEntry)
    );
    
    return true;
  },
  
  // Delete a password entry
  delete: async (id: number): Promise<boolean> => {
    try {
      await executeTransaction(
        PASSWORDS_STORE,
        'readwrite',
        (store) => store.delete(id)
      );
      return true;
    } catch (error) {
      console.error('Error deleting password:', error);
      return false;
    }
  },

  // Search for password entries
  search: async (query: string, masterKey: string): Promise<PasswordEntry[]> => {
    const allEntries = await passwordsDB.getAll(masterKey);
    const searchLower = query.toLowerCase();
    
    return allEntries.filter(entry => 
      entry.site_name.toLowerCase().includes(searchLower) ||
      entry.site_url.toLowerCase().includes(searchLower) ||
      entry.username.toLowerCase().includes(searchLower) ||
      entry.notes.toLowerCase().includes(searchLower)
    );
  }
};

// Export a mock DB object
const db = {
  exec: (sql: string) => {
    console.log('Mock SQL execution:', sql);
    return true;
  }
};

export default db;
