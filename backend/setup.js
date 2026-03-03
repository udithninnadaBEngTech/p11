import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '========================================');
console.log('\x1b[36m%s\x1b[0m', '   Firebase Admin SDK Setup');
console.log('\x1b[36m%s\x1b[0m', '========================================\n');

console.log('Please follow these steps:');
console.log('1. Go to https://console.firebase.google.com');
console.log('2. Select your project "udithedu"');
console.log('3. Go to Project Settings > Service Accounts');
console.log('4. Click "Generate New Private Key"');
console.log('5. Download the JSON file\n');

rl.question('Enter the path to your downloaded JSON file: ', (filePath) => {
  try {
    // Remove quotes if present
    filePath = filePath.replace(/['"]/g, '');
    
    // Read the downloaded file
    const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Create serviceAccountKey.json
    fs.writeFileSync(
      join(__dirname, 'serviceAccountKey.json'),
      JSON.stringify(serviceAccount, null, 2)
    );
    
    // Create .env file
    const envContent = `PORT=5000
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_CLIENT_ID=${serviceAccount.client_id}
FIREBASE_CLIENT_CERT_URL=${serviceAccount.client_x509_cert_url}
`;
    
    fs.writeFileSync(join(__dirname, '.env'), envContent);
    
    console.log('\x1b[32m%s\x1b[0m', '\n✅ Setup completed successfully!');
    console.log('\x1b[32m%s\x1b[0m', 'Files created:');
    console.log('   - serviceAccountKey.json');
    console.log('   - .env\n');
    console.log('You can now run: npm run dev');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '\n❌ Error:', error.message);
  }
  
  rl.close();
});