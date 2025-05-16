
import Database from 'better-sqlite3';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';

// Path to store the database in the user's home directory
const userHome = process.env.HOME || process.env.USERPROFILE || '.';
const DB_PATH = path.join(userHome, '.safekeep', 'vault.db');
const MASTER_PATH = path.join(userHome, '.safekeep', 'master.json');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS passwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_url TEXT,
    site_name TEXT,
    username TEXT,
    password_encrypted TEXT,
    created_at TEXT,
    modified_at TEXT,
    notes TEXT
  );
  
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Encryption/decryption functions
export function encryptData(data: string, masterKey: string): string {
  return CryptoJS.AES.encrypt(data, masterKey).toString();
}

export function decryptData(encryptedData: string, masterKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Check if master password exists
export function masterExists(): boolean {
  return fs.existsSync(MASTER_PATH);
}

// Initialize master password (hash it and store it)
export function initializeMaster(password: string): void {
  const hashedPassword = CryptoJS.SHA256(password).toString();
  const salt = CryptoJS.lib.WordArray.random(128/8).toString();
  
  const masterData = {
    hash: CryptoJS.PBKDF2(hashedPassword, salt, { keySize: 512/32, iterations: 1000 }).toString(),
    salt: salt
  };
  
  fs.writeFileSync(MASTER_PATH, JSON.stringify(masterData), 'utf-8');
}

// Verify master password
export function verifyMaster(password: string): boolean {
  try {
    const masterData = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf-8'));
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

// Password entry type
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

// Database operations
export const passwordsDB = {
  // Add new password entry
  create: (entry: PasswordEntry, masterKey: string): number => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO passwords (site_url, site_name, username, password_encrypted, created_at, modified_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const encryptedPassword = encryptData(entry.password, masterKey);
    
    const result = stmt.run(
      entry.site_url,
      entry.site_name,
      entry.username,
      encryptedPassword,
      now,
      now,
      entry.notes
    );
    
    return result.lastInsertRowid as number;
  },
  
  // Get all password entries
  getAll: (masterKey: string): PasswordEntry[] => {
    const stmt = db.prepare('SELECT * FROM passwords ORDER BY site_name');
    const rows = stmt.all() as Array<any>;
    
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
  get: (id: number, masterKey: string): PasswordEntry | null => {
    const stmt = db.prepare('SELECT * FROM passwords WHERE id = ?');
    const row = stmt.get(id) as any;
    
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
  update: (entry: PasswordEntry, masterKey: string): boolean => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE passwords 
      SET site_url = ?, site_name = ?, username = ?, 
          password_encrypted = ?, modified_at = ?, notes = ?
      WHERE id = ?
    `);
    
    const encryptedPassword = encryptData(entry.password, masterKey);
    
    const result = stmt.run(
      entry.site_url,
      entry.site_name,
      entry.username,
      encryptedPassword,
      now,
      entry.notes,
      entry.id
    );
    
    return result.changes > 0;
  },
  
  // Delete a password entry
  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM passwords WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Search for password entries
  search: (query: string, masterKey: string): PasswordEntry[] => {
    const stmt = db.prepare(`
      SELECT * FROM passwords 
      WHERE site_name LIKE ? OR site_url LIKE ? OR username LIKE ? OR notes LIKE ?
    `);
    
    const searchPattern = `%${query}%`;
    const rows = stmt.all(
      searchPattern, 
      searchPattern, 
      searchPattern, 
      searchPattern
    ) as Array<any>;
    
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
  }
};

export default db;
