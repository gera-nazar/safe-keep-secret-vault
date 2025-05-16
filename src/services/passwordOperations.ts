
import { executeTransaction, PASSWORDS_STORE } from './databaseCore';
import { encryptData, decryptData } from './encryption';

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
