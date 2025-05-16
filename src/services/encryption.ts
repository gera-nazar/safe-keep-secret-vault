
import CryptoJS from 'crypto-js';

// Encryption/decryption functions
export function encryptData(data: string, masterKey: string): string {
  return CryptoJS.AES.encrypt(data, masterKey).toString();
}

export function decryptData(encryptedData: string, masterKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
