
# SafeKeep - Local Password Vault Viewer

A simple, secure, client-side password vault viewer that works entirely in your browser.

## Features

- 🔒 **Entirely Client-Side**: No server communication or database needed
- 🔑 **Local Encryption**: Works with encrypted .vault files
- 👁️ **Password Viewing**: View your passwords securely
- 🔍 **Search**: Easily search through your passwords
- 📋 **Copy to Clipboard**: One-click copying of usernames and passwords

## How to Use

1. **Upload your .vault file**: Click on the upload area or drag and drop your vault file
2. **Enter your master password**: Use the same password that encrypted the vault
3. **Browse your passwords**: All your passwords are displayed in a tabular format
4. **Search**: Use the search box to quickly find specific passwords
5. **Reveal/Hide Passwords**: Toggle password visibility as needed
6. **Copy to Clipboard**: Click the copy button to copy usernames or passwords

## Generating a Vault File

Use the included node script to generate your own encrypted vault file:

```bash
node src/scripts/generate-vault.js
```

Follow the prompts to:
1. Specify your JSON password file
2. Enter a master password for encryption

## Vault File Format

The JSON format for the password file should be:

```json
{
  "metadata": {
    "version": "1.0.0",
    "createdAt": "2023-05-16T12:00:00.000Z",
    "updatedAt": "2023-05-16T12:00:00.000Z",
    "name": "My Passwords"
  },
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
```

Or as a simple array:

```json
[
  {
    "site_name": "Example",
    "site_url": "https://example.com",
    "username": "user@example.com",
    "password": "securepassword123"
  }
]
```

## Security

- Your vault file is only decrypted in memory, in your browser
- No data is ever sent to any server
- All encryption/decryption happens locally using the CryptoJS library
- Your master password is never stored

## Privacy

- No analytics, tracking or telemetry
- No cookies or local storage used (except for temporary session data)
- No network requests outside of loading the application itself

## Deployment

This application can be deployed as a static website on platforms like:
- GitHub Pages
- Netlify
- Vercel
- Any static web hosting

## Development

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start the development server
4. Run `npm run build` to build the application for production

## License

MIT License
