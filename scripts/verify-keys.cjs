const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const keysDir = path.resolve(__dirname, '../keys');
const privPath = path.join(keysDir, 'merchant_private.pem');
const pubPath = path.join(keysDir, 'merchant_public.pem');
const csrPath = path.join(keysDir, 'merchant.csr');

try {
  const privPem = fs.readFileSync(privPath, 'utf8');
  const pubPem = fs.readFileSync(pubPath, 'utf8');
  const csrPem = fs.readFileSync(csrPath, 'utf8');

  const privateKey = forge.pki.privateKeyFromPem(privPem);
  const derivedPubKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
  const derivedPubPem = forge.pki.publicKeyToPem(derivedPubKey);

  // 1. Verify Public Key matches Private Key
  const cleanPub = pubPem.replace(/\r/g, '').trim();
  const cleanDerived = derivedPubPem.replace(/\r/g, '').trim();
  
  if (cleanPub === cleanDerived) {
    console.log('✅ PUBLIC_KEY_MATCHES_PRIVATE_KEY');
  } else {
    console.error('❌ PUBLIC_KEY_MISMATCH');
    console.log('Derived:\n' + derivedPubPem);
    console.log('Actual:\n' + pubPem);
  }

  // 2. Verify CSR
  const csr = forge.pki.certificationRequestFromPem(csrPem);
  const csrVerified = csr.verify();
  
  if (csrVerified) {
    console.log('✅ CSR_SIGNATURE_VALID');
  } else {
    console.error('❌ CSR_SIGNATURE_INVALID');
  }

  const csrPubPem = forge.pki.publicKeyToPem(csr.publicKey);
  if (csrPubPem.replace(/\r/g, '').trim() === cleanDerived) {
    console.log('✅ CSR_PUBLIC_KEY_MATCHES_PRIVATE_KEY');
  } else {
    console.error('❌ CSR_PUBLIC_KEY_MISMATCH');
  }

  console.log('\n--- CSR SUBJECT ---');
  csr.subject.attributes.forEach(attr => {
    console.log(`${attr.shortName || attr.name}: ${attr.value}`);
  });

} catch (err) {
  console.error('❌ ERROR: ' + err.message);
  process.exit(1);
}
