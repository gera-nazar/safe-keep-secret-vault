
import db from './databaseCore';
export { encryptData, decryptData } from './encryption';
export { masterExists, initializeMaster, verifyMaster } from './masterPassword';
export { passwordsDB, type PasswordEntry } from './passwordOperations';

export default db;
