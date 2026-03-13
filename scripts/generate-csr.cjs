/**
 * Generate CSR (Certificate Signing Request) using Node.js built-in crypto
 * Run: node scripts/generate-csr.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ── Read existing private key ─────────────────────────────────────────
const privateKeyPath = path.resolve(__dirname, '../keys/merchant_private.pem');

if (!fs.existsSync(privateKeyPath)) {
  console.error('❌ Private key not found at keys/merchant_private.pem');
  process.exit(1);
}

const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');

// ── Generate CSR manually using forge-style approach ─────────────────
// Node.js built-in crypto doesn't support CSR generation directly
// We'll use the x509 module approach

// Subject fields for OurStore
const subject = [
  { shortName: 'C',  value: 'BT' },           // Country: Bhutan
  { shortName: 'ST', value: 'Paro' },          // State
  { shortName: 'L',  value: 'Paro' },          // City
  { shortName: 'O',  value: 'OurStore' },      // Organization
  { shortName: 'OU', value: 'IT' },            // Org Unit
  { shortName: 'CN', value: 'ourstore.tech' }, // Common Name (domain)
];

console.log('\n📋 CSR Subject Details:');
subject.forEach(s => console.log(`   ${s.shortName}: ${s.value}`));

// Check if node-forge is available
try {
  const forge = require('node-forge');

  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const publicKey  = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);

  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = publicKey;
  csr.setSubject(subject);
  csr.sign(privateKey, forge.md.sha1.create());

  const csrPem = forge.pki.certificationRequestToPem(csr);

  // Save CSR
  const csrPath = path.resolve(__dirname, '../keys/merchant.csr');
  fs.writeFileSync(csrPath, csrPem);

  console.log('\n✅ CSR generated successfully!');
  console.log(`📁 Saved to: keys/merchant.csr`);
  console.log('\n📄 CSR Content (send this to BFS):');
  console.log('─'.repeat(60));
  console.log(csrPem);
  console.log('─'.repeat(60));
  console.log('\n📤 Send keys/merchant.csr to BFS Secure team.');
  console.log('🔒 NEVER send keys/merchant_private.pem to anyone.\n');

} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('\n⚠️  node-forge not installed. Installing...');
    console.log('Run: npm install node-forge --save-dev');
    console.log('Then run this script again.\n');
  } else {
    throw e;
  }
}
