
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const readline = require('readline');

// Create interface for reading input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to encrypt data with AES
function encryptData(data, password) {
  return CryptoJS.AES.encrypt(data, password).toString();
}

// Ask for input file path
rl.question('Enter the path to your JSON passwords file: ', (inputPath) => {
  // Ask for the master password
  rl.question('Enter the master password for encryption: ', (password) => {
    try {
      // Read the input file
      const jsonData = fs.readFileSync(path.resolve(inputPath), 'utf8');
      let passwordData = JSON.parse(jsonData);
      
      // If the data is just an array, wrap it in the expected vault structure
      if (Array.isArray(passwordData)) {
        const now = new Date().toISOString();
        passwordData = {
          metadata: {
            version: '1.0.0',
            createdAt: now,
            updatedAt: now,
            name: 'Generated Vault'
          },
          entries: passwordData.map((entry, index) => ({
            id: index + 1,
            ...entry,
            created_at: entry.created_at || now,
            modified_at: entry.modified_at || now
          }))
        };
      }
      
      // Encrypt the data
      const encryptedData = encryptData(JSON.stringify(passwordData), password);
      
      // Determine output path
      const outputDir = path.dirname(inputPath);
      const fileName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(outputDir, `${fileName}.vault`);
      
      // Write the encrypted data to the output file
      fs.writeFileSync(outputPath, encryptedData);
      
      console.log(`\nVault file successfully created at: ${outputPath}`);
    } catch (error) {
      console.error('Error creating vault file:', error.message);
    } finally {
      rl.close();
    }
  });
});

// Usage instructions shown when script is executed
console.log('\n=== SafeKeep Vault Generator ===');
console.log('This tool creates an encrypted .vault file from a JSON file containing your passwords.');
console.log('Input format example:');
console.log(`
{
  "entries": [
    {
      "site_name": "Example",
      "site_url": "https://example.com",
      "username": "user@example.com",
      "password": "securepassword123",
      "notes": "Optional notes"
    }
  ]
}
`);
console.log('Or a simple array of password entries:');
console.log(`
[
  {
    "site_name": "Example",
    "site_url": "https://example.com",
    "username": "user@example.com",
    "password": "securepassword123"
  }
]
`);
