/**
 * BFS Secure — RSA SHA1 Checksum Utilities
 *
 * Source-string is built by sorting field names alphabetically,
 * then joining their VALUES with "|".
 *
 * The source-string is signed with the merchant's RSA private key (SHA1)
 * for outbound AR requests, and verified with BFS Secure's RSA public key
 * for inbound AC responses.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BFS_PRIVATE_KEY_PATH, BFS_PUBLIC_KEY_PATH } from './constants';

// ── Cached keys (loaded once per process) ───────────────────────────
let _privateKeyObj: crypto.KeyObject | null = null;
let _publicKeyPem: string | null = null;

/**
 * Extract raw base64 from a PEM string (or env-var mangled PEM),
 * stripping headers/footers and all whitespace.
 */
function extractBase64FromPEM(raw: string): string {
  let s = raw.trim().replace(/^"|"$/g, '').trim();
  s = s.replace(/\\n/g, '\n').replace(/\\r/g, '');
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '');
  s = s.replace(/[^\x20-\x7E\n]/g, '');
  s = s.replace(/-----BEGIN [A-Z ]+-----/g, '');
  s = s.replace(/-----END [A-Z ]+-----/g, '');
  s = s.replace(/\s+/g, '');
  return s;
}

/**
 * Join split environment variable parts (BFS_PRIVATE_KEY_P1, _P2, etc.)
 */
function joinSplitKeyRaw(prefix: string): string | null {
  const parts: string[] = [];
  let i = 1;
  while (process.env[`${prefix}_P${i}`]) {
    parts.push(process.env[`${prefix}_P${i}`]!);
    i++;
  }
  if (parts.length > 0) {
    console.log(`[BFS] Found ${parts.length} split parts for ${prefix}`);
  }
  return parts.length > 0 ? parts.join('') : null;
}

/**
 * Normalize a PEM key string to proper format.
 * Ensures the key has correct headers and 64-char line breaks.
 */
function normalizePEM(key: string, defaultType: string = 'PUBLIC KEY'): string {
  let s = key.trim().replace(/^"|"$/g, '').trim();
  s = s.replace(/\\n/g, '\n').replace(/\\r/g, '');
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '');
  s = s.replace(/[^\x20-\x7E\n]/g, '');

  const headerMatch = s.match(/-----BEGIN ([A-Z ]+)-----/);
  const footerMatch = s.match(/-----END ([A-Z ]+)-----/);

  if (headerMatch && footerMatch) {
    const header = headerMatch[0];
    const footer = footerMatch[0];
    const base64Part = s.substring(
      s.indexOf(header) + header.length,
      s.indexOf(footer)
    ).replace(/\s+/g, '');
    const lines = base64Part.match(/.{1,64}/g) || [];
    return `${header}\n${lines.join('\n')}\n${footer}\n`;
  }

  // If no headers found, assume it's just base64 and add standard headers
  const cleanBase64 = s.replace(/\s+/g, '');
  const lines = cleanBase64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${defaultType}-----\n${lines.join('\n')}\n-----END ${defaultType}-----\n`;
}

// ── Private Key ─────────────────────────────────────────────────────

/**
 * Load the private key as a crypto.KeyObject using DER format.
 * This bypasses OpenSSL 3.0's PEM parser issues on Hostinger.
 */
export function getPrivateKeyObject(): crypto.KeyObject {
  if (!_privateKeyObj) {
    const rawKey = process.env.BFS_PRIVATE_KEY || joinSplitKeyRaw('BFS_PRIVATE_KEY');

    if (rawKey && rawKey.includes('BEGIN')) {
      const base64 = extractBase64FromPEM(rawKey);
      console.log(`[BFS] Extracted private key base64, length: ${base64.length}`);

      const derBuffer = Buffer.from(base64, 'base64');
      console.log(`[BFS] Private key DER buffer: ${derBuffer.length} bytes`);

      const isPKCS1 = rawKey.includes('RSA PRIVATE KEY');
      const keyType = isPKCS1 ? 'pkcs1' : 'pkcs8';

      try {
        _privateKeyObj = crypto.createPrivateKey({
          key: derBuffer, format: 'der', type: keyType,
        });
        console.log(`[BFS] ✅ Private key loaded via DER (${keyType})`);
      } catch (derErr) {
        const altType = isPKCS1 ? 'pkcs8' : 'pkcs1';
        try {
          _privateKeyObj = crypto.createPrivateKey({
            key: derBuffer, format: 'der', type: altType,
          });
          console.log(`[BFS] ✅ Private key loaded via DER (${altType})`);
        } catch {
          console.error('[BFS] DER load failed, trying reconstructed PEM...');
          const lines = base64.match(/.{1,64}/g) || [];
          const cleanPem = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
          _privateKeyObj = crypto.createPrivateKey(cleanPem);
          console.log('[BFS] ✅ Private key loaded via reconstructed PEM');
        }
      }
      return _privateKeyObj;
    }

    const keyPath = path.resolve(process.cwd(), BFS_PRIVATE_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS private key not found at ${keyPath} and BFS_PRIVATE_KEY env var is not set.`
      );
    }
    _privateKeyObj = crypto.createPrivateKey(fs.readFileSync(keyPath, 'utf-8'));
    console.log('[BFS] Loaded private key from file:', keyPath);
  }
  return _privateKeyObj;
}

// ── Public Key ──────────────────────────────────────────────────────

/**
 * Get the public key as a properly formatted, validated PEM string.
 */
export function getPublicKey(): string {
  if (!_publicKeyPem) {
    const directKey = process.env.BFS_PUBLIC_KEY || joinSplitKeyRaw('BFS_PUBLIC_KEY');

    if (directKey) {
      _publicKeyPem = normalizePEM(directKey, 'PUBLIC KEY');
      console.log('[BFS] Loaded and normalized public key from env var');
      console.log(`[BFS] Public key PEM length: ${_publicKeyPem.length}`);
      console.log(`[BFS] First 60: ${_publicKeyPem.substring(0, 60).replace(/\n/g, '\\n')}`);

      // Validate the key immediately
      try {
        crypto.createPublicKey(_publicKeyPem);
        console.log('[BFS] ✅ Public key is valid');
      } catch (keyErr) {
        console.error('[BFS] ❌ Public key PEM validation failed:', (keyErr as Error).message);
        // Try DER approach as fallback
        try {
          const base64 = extractBase64FromPEM(directKey);
          const derBuffer = Buffer.from(base64, 'base64');
          const keyObj = crypto.createPublicKey({
            key: derBuffer, format: 'der', type: 'spki',
          });
          _publicKeyPem = keyObj.export({ type: 'spki', format: 'pem' }) as string;
          console.log('[BFS] ✅ Public key loaded via DER fallback');
        } catch (derErr) {
          console.error('[BFS] ❌ DER fallback also failed:', (derErr as Error).message);
        }
      }

      return _publicKeyPem;
    }

    const keyPath = path.resolve(process.cwd(), BFS_PUBLIC_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS public key not found at ${keyPath} and BFS_PUBLIC_KEY env var is not set.`
      );
    }
    _publicKeyPem = fs.readFileSync(keyPath, 'utf-8');
    console.log('[BFS] Loaded public key from file:', keyPath);
  }
  return _publicKeyPem;
}

// ── Source String ───────────────────────────────────────────────────

/**
 * Build the BFS source string from a set of fields.
 * Fields are sorted alphabetically by name, values joined with "|".
 */
export function buildSourceString(fields: Record<string, string>): string {
  const keys = Object.keys(fields).filter(
    (k) => k.toLowerCase() !== 'bfs_checksum' && fields[k] !== undefined
  );
  keys.sort((a, b) => a.localeCompare(b));
  const values = keys.map((k) => fields[k] || '');
  const sourceString = values.join('|');

  console.log('[BFS-DEBUG] Source string keys:', keys);
  console.log('[BFS-DEBUG] Source string values:', values);
  console.log('[BFS-DEBUG] Source string:', sourceString);
  return sourceString;
}

// ── Signing ─────────────────────────────────────────────────────────

/** PKCS#1 v1.5 DigestInfo header for SHA-1 */
const SHA1_DIGEST_INFO_PREFIX = Buffer.from(
  '3021300906052b0e03021a05000414', 'hex'
);

/**
 * Sign a source-string with the merchant's RSA private key using SHA1.
 */
export function signRequest(sourceString: string): string {
  const keyObj = getPrivateKeyObject();

  // Method 1: crypto.sign() with KeyObject
  try {
    const signature = crypto.sign(
      'sha1',
      Buffer.from(sourceString, 'utf8'),
      { key: keyObj, padding: crypto.constants.RSA_PKCS1_PADDING }
    );
    console.log('[BFS] ✅ Signature created via crypto.sign()');
    return signature.toString('hex').toUpperCase();
  } catch (err) {
    console.log('[BFS] crypto.sign() failed:', (err as Error).message);
  }

  // Method 2: Manual PKCS#1 v1.5 via privateEncrypt
  try {
    const sha1Hash = crypto.createHash('sha1').update(sourceString).digest();
    const digestInfo = Buffer.concat([SHA1_DIGEST_INFO_PREFIX, sha1Hash]);
    const privateKeyPem = keyObj.export({ type: 'pkcs1', format: 'pem' });

    const signature = crypto.privateEncrypt(
      { key: privateKeyPem as string, padding: crypto.constants.RSA_PKCS1_PADDING },
      digestInfo
    );
    console.log('[BFS] ✅ Signature created via manual PKCS#1 v1.5');
    return signature.toString('hex').toUpperCase();
  } catch (err2) {
    console.error('[BFS] All signing methods failed:', (err2 as Error).message);
    throw new Error(`BFS signing failed: ${(err2 as Error).message}`);
  }
}

// ── Verification ────────────────────────────────────────────────────

/**
 * Verify a BFS response checksum using BFS Secure's RSA public key.
 */
export function verifyResponse(sourceString: string, checksumHex: string): boolean {
  if (!checksumHex) {
    console.error('[BFS-VERIFY] No checksum provided');
    return false;
  }
  console.log(`[BFS-VERIFY] Verifying checksum (length: ${checksumHex.length})`);

  const publicKeyPem = getPublicKey();

  // Method 1: crypto.createVerify('SHA1')
  try {
    const verifier = crypto.createVerify('SHA1');
    verifier.update(sourceString);
    verifier.end();
    const isValid = verifier.verify(publicKeyPem, Buffer.from(checksumHex, 'hex'));
    console.log(`[BFS-VERIFY] createVerify() returned: ${isValid}`);
    if (isValid) return true;
  } catch (err) {
    console.log('[BFS-VERIFY] createVerify() failed:', (err as Error).message);
  }

  // Method 2: crypto.verify() with explicit padding
  try {
    const isValid = crypto.verify(
      'sha1',
      Buffer.from(sourceString, 'utf8'),
      { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(checksumHex, 'hex')
    );
    console.log(`[BFS-VERIFY] crypto.verify() returned: ${isValid}`);
    if (isValid) return true;
  } catch (err) {
    console.log('[BFS-VERIFY] crypto.verify() failed:', (err as Error).message);
  }

  // Method 3: Manual PKCS#1 v1.5 via publicDecrypt
  try {
    console.log('[BFS-VERIFY] Trying manual publicDecrypt...');
    const sha1Hash = crypto.createHash('sha1').update(sourceString).digest();
    const expectedDigestInfo = Buffer.concat([SHA1_DIGEST_INFO_PREFIX, sha1Hash]);
    const signatureBuffer = Buffer.from(checksumHex, 'hex');

    const decrypted = crypto.publicDecrypt(
      { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      signatureBuffer
    );

    const isValid = decrypted.equals(expectedDigestInfo);
    if (isValid) {
      console.log('[BFS-VERIFY] ✅ Manual verification successful');
    } else {
      console.log('[BFS-VERIFY] ❌ Digest mismatch');
      console.log('[BFS-VERIFY] Expected:', expectedDigestInfo.toString('hex').substring(0, 64));
      console.log('[BFS-VERIFY] Got:     ', decrypted.toString('hex').substring(0, 64));
    }
    return isValid;
  } catch (err) {
    console.error('[BFS-VERIFY] Manual publicDecrypt failed:', (err as Error).message);
  }

  // Method 4: Try with DER-loaded KeyObject
  try {
    console.log('[BFS-VERIFY] Trying DER KeyObject approach...');
    const base64 = extractBase64FromPEM(publicKeyPem);
    const derBuffer = Buffer.from(base64, 'base64');
    const keyObj = crypto.createPublicKey({ key: derBuffer, format: 'der', type: 'spki' });

    // Re-export as clean PEM
    const cleanPem = keyObj.export({ type: 'spki', format: 'pem' }) as string;

    const sha1Hash = crypto.createHash('sha1').update(sourceString).digest();
    const expectedDigestInfo = Buffer.concat([SHA1_DIGEST_INFO_PREFIX, sha1Hash]);
    const signatureBuffer = Buffer.from(checksumHex, 'hex');

    const decrypted = crypto.publicDecrypt(
      { key: cleanPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      signatureBuffer
    );

    const isValid = decrypted.equals(expectedDigestInfo);
    console.log(`[BFS-VERIFY] DER KeyObject approach result: ${isValid}`);
    return isValid;
  } catch (err) {
    console.error('[BFS-VERIFY] DER KeyObject approach failed:', (err as Error).message);
  }

  console.error('[BFS-VERIFY] ❌ All verification methods failed');
  return false;
}
