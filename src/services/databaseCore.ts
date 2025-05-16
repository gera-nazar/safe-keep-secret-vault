
// Database core operations using IndexedDB
const DB_NAME = 'safekeepVault';
const DB_VERSION = 1;
export const PASSWORDS_STORE = 'passwords';
export const SETTINGS_STORE = 'settings';

// Open IndexedDB connection
export function openDatabase(): Promise<IDBDatabase> {
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
export const executeTransaction = async <T>(
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

// Export a mock DB object for compatibility
const db = {
  exec: (sql: string) => {
    console.log('Mock SQL execution:', sql);
    return true;
  }
};

export default db;
