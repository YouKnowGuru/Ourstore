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


/**
 * Extract raw base64 from a PEM string (or env-var mangled PEM),
 * stripping headers/footers and all whitespace.
 */
function extractBase64FromPEM(raw: string): string {
  let s = raw.trim().replace(/^"|"$/g, '').trim();
  // Convert literal \n and \r escape sequences
  s = s.replace(/\\n/g, '\n').replace(/\\r/g, '');
  // Normalize line endings
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '');
  // Remove invisible/BOM characters
  s = s.replace(/[^\x20-\x7E\n]/g, '');
  // Strip PEM headers and footers
  s = s.replace(/-----BEGIN [A-Z ]+-----/g, '');
  s = s.replace(/-----END [A-Z ]+-----/g, '');
  // Remove ALL whitespace to get pure base64
  s = s.replace(/\s+/g, '');
  return s;
}

/**
 * Join split environment variable parts (BFS_PRIVATE_KEY_P1, _P2, etc.)
 * and return the raw concatenated string.
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
 * Load the private key as a crypto.KeyObject using DER format.
 * This completely bypasses OpenSSL's PEM parser which fails on
 * Hostinger's OpenSSL 3.0 with "DECODER routines::unsupported".
 */
export function getPrivateKeyObject(): crypto.KeyObject {
  if (!_privateKeyObj) {
    const rawKey = process.env.BFS_PRIVATE_KEY || joinSplitKeyRaw('BFS_PRIVATE_KEY');

    if (rawKey && rawKey.includes('BEGIN')) {
      const base64 = extractBase64FromPEM(rawKey);
      console.log(`[BFS] Extracted base64 from env var, length: ${base64.length}`);

      const derBuffer = Buffer.from(base64, 'base64');
      console.log(`[BFS] DER buffer length: ${derBuffer.length} bytes`);

      // Try PKCS#8 first (-----BEGIN PRIVATE KEY-----), then PKCS#1 (-----BEGIN RSA PRIVATE KEY-----)
      const isPKCS1 = rawKey.includes('RSA PRIVATE KEY');
      const keyType = isPKCS1 ? 'pkcs1' : 'pkcs8';
      console.log(`[BFS] Detected key type: ${keyType}`);

      try {
        _privateKeyObj = crypto.createPrivateKey({
          key: derBuffer,
          format: 'der',
          type: keyType,
        });
        console.log('[BFS] ✅ Private key loaded successfully via DER format');
      } catch (derErr) {
        console.error('[BFS] DER load failed, trying alternate type...', (derErr as Error).message);
        // If PKCS#8 failed, try PKCS#1 and vice versa
        const altType = isPKCS1 ? 'pkcs8' : 'pkcs1';
        try {
          _privateKeyObj = crypto.createPrivateKey({
            key: derBuffer,
            format: 'der',
            type: altType,
          });
          console.log(`[BFS] ✅ Private key loaded successfully via DER format (${altType})`);
        } catch (altErr) {
          console.error('[BFS] Both DER formats failed. Trying reconstructed PEM as last resort...');
          // Last resort: reconstruct a clean PEM and try that
          const lines = base64.match(/.{1,64}/g) || [];
          const cleanPem = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
          _privateKeyObj = crypto.createPrivateKey(cleanPem);
          console.log('[BFS] ✅ Private key loaded via reconstructed PEM');
        }
      }
      return _privateKeyObj;
    }

    // Fallback to reading from file path
    const keyPath = path.resolve(process.cwd(), BFS_PRIVATE_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS private key not found at ${keyPath} and BFS_PRIVATE_KEY (or _P1, _P2...) env var is not set. ` +
        'Generate an RSA key pair or set the keys correctly.'
      );
    }
    const fileContent = fs.readFileSync(keyPath, 'utf-8');
    _privateKeyObj = crypto.createPrivateKey(fileContent);
    console.log('[BFS] Loaded private key from file:', keyPath);
  }
  return _privateKeyObj;
}

// ── Cached public key ───────────────────────────────────────────────
let _publicKeyObj: crypto.KeyObject | null = null;

/**
 * Load the public key as a crypto.KeyObject using DER format.
 * Same DER bypass approach as the private key to avoid OpenSSL 3.0 PEM issues.
 */
export function getPublicKeyObject(): crypto.KeyObject {
  if (!_publicKeyObj) {
    const rawKey = process.env.BFS_PUBLIC_KEY || joinSplitKeyRaw('BFS_PUBLIC_KEY');

    if (rawKey && rawKey.includes('BEGIN')) {
      const base64 = extractBase64FromPEM(rawKey);
      console.log(`[BFS] Public key base64 extracted, length: ${base64.length}`);

      const derBuffer = Buffer.from(base64, 'base64');
      console.log(`[BFS] Public key DER buffer length: ${derBuffer.length} bytes`);

      const isRSA = rawKey.includes('RSA PUBLIC KEY');
      const keyType = isRSA ? 'pkcs1' : 'spki';
      console.log(`[BFS] Public key type: ${keyType}`);

      try {
        _publicKeyObj = crypto.createPublicKey({
          key: derBuffer,
          format: 'der',
          type: keyType,
        });
        console.log('[BFS] ✅ Public key loaded successfully via DER format');
      } catch (derErr) {
        console.error('[BFS] DER public key load failed, trying alternate type...', (derErr as Error).message);
        const altType = isRSA ? 'spki' : 'pkcs1';
        try {
          _publicKeyObj = crypto.createPublicKey({
            key: derBuffer,
            format: 'der',
            type: altType,
          });
          console.log(`[BFS] ✅ Public key loaded successfully via DER format (${altType})`);
        } catch (altErr) {
          console.error('[BFS] Both DER formats failed. Trying reconstructed PEM...');
          const lines = base64.match(/.{1,64}/g) || [];
          const header = isRSA ? 'RSA PUBLIC KEY' : 'PUBLIC KEY';
          const cleanPem = `-----BEGIN ${header}-----\n${lines.join('\n')}\n-----END ${header}-----\n`;
          _publicKeyObj = crypto.createPublicKey(cleanPem);
          console.log('[BFS] ✅ Public key loaded via reconstructed PEM');
        }
      }
      return _publicKeyObj;
    }

    // Fallback to file
    const keyPath = path.resolve(process.cwd(), BFS_PUBLIC_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS public key not found at ${keyPath} and BFS_PUBLIC_KEY (or _P1, _P2...) env var is not set. ` +
        'Obtain the BFS Secure public key from RMA or set the keys correctly.'
      );
    }
    const fileContent = fs.readFileSync(keyPath, 'utf-8');
    _publicKeyObj = crypto.createPublicKey(fileContent);
    console.log('[BFS] Loaded public key from file:', keyPath);
  }
  return _publicKeyObj;
}

// Keep backward compat for any code that calls getPublicKey() and expects a string
export function getPublicKey(): string {
  const keyObj = getPublicKeyObject();
  return keyObj.export({ type: 'spki', format: 'pem' }) as string;
}

/**
 * Build the BFS source string from a set of fields.
 *
 * IMPORTANT: BFS Secure requires fields to be sorted alphabetically
 * by field name for checksum calculation.
 *
 * @param fields  Key-value map of BFS fields
 * @returns       Pipe-separated source string ready for signing
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

/**
 * PKCS#1 v1.5 DigestInfo header for SHA-1.
 */
const SHA1_DIGEST_INFO_PREFIX = Buffer.from(
  '3021300906052b0e03021a05000414',
  'hex'
);

/**
 * Sign a source-string with the merchant's RSA private key using SHA1.
 *
 * @param sourceString  The pipe-separated source string
 * @returns             Uppercase Hex-encoded signature
 */
export function signRequest(sourceString: string): string {
  const keyObj = getPrivateKeyObject();

  try {
    // Primary: Use crypto.sign() with explicit padding
    const signature = crypto.sign(
      'sha1',
      Buffer.from(sourceString, 'utf8'),
      {
        key: keyObj,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      }
    );

    console.log('[BFS] ✅ RSA-SHA1 signature created via crypto.sign()');
    return signature.toString('hex').toUpperCase();
  } catch (error: unknown) {
    console.error('[BFS] crypto.sign() failed:', (error as Error).message);

    // Fallback: Manual PKCS#1 v1.5 signing via privateEncrypt
    try {
      console.log('[BFS] Trying manual PKCS#1 v1.5 signing...');
      const sha1Hash = crypto.createHash('sha1').update(sourceString).digest();
      const digestInfo = Buffer.concat([SHA1_DIGEST_INFO_PREFIX, sha1Hash]);

      // Export as PEM for privateEncrypt
      const privateKeyPem = keyObj.export({ type: 'pkcs1', format: 'pem' });

      const signature = crypto.privateEncrypt(
        { key: privateKeyPem as string, padding: crypto.constants.RSA_PKCS1_PADDING },
        digestInfo
      );

      console.log('[BFS] ✅ Manual PKCS#1 v1.5 signing succeeded');
      return signature.toString('hex').toUpperCase();
    } catch (fallbackError: unknown) {
      console.error('[BFS] All signing methods failed:', (fallbackError as Error).message);
      throw new Error(`BFS signing failed: ${(error as Error).message}`);
    }
  }
}

/**
 * Verify a BFS response checksum using BFS Secure's RSA public key.
 *
 * @param sourceString  The pipe-separated source string reconstructed from the response
 * @param checksumHex   Hex-encoded checksum received from BFS
 * @returns             `true` if signature is valid
 */
export function verifyResponse(sourceString: string, checksumHex: string): boolean {
  if (!checksumHex) {
    console.error('[BFS-VERIFY] No checksum provided — cannot verify');
    return false;
  }
  console.log(`[BFS-VERIFY] Attempting verification, checksum length: ${checksumHex.length}`);

  try {
    const keyObj = getPublicKeyObject();
    console.log('[BFS-VERIFY] Public KeyObject loaded successfully');

    // Primary: Use crypto.verify() with KeyObject
    try {
      const isValid = crypto.verify(
        'sha1',
        Buffer.from(sourceString, 'utf8'),
        { key: keyObj, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(checksumHex, 'hex')
      );
      console.log(`[BFS-VERIFY] crypto.verify() returned: ${isValid}`);
      return isValid;
    } catch (verifyErr) {
      console.log('[BFS-VERIFY] crypto.verify() failed:', (verifyErr as Error).message);
    }

    // Fallback: Manual PKCS#1 v1.5 verification via publicDecrypt
    try {
      console.log('[BFS-VERIFY] Trying manual publicDecrypt verification...');
      const sha1Hash = crypto.createHash('sha1').update(sourceString).digest();
      const expectedDigestInfo = Buffer.concat([SHA1_DIGEST_INFO_PREFIX, sha1Hash]);
      const signatureBuffer = Buffer.from(checksumHex, 'hex');

      // Export public key as PEM for publicDecrypt
      const publicKeyPem = keyObj.export({ type: 'spki', format: 'pem' }) as string;

      const decrypted = crypto.publicDecrypt(
        { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
        signatureBuffer
      );

      const isValid = decrypted.equals(expectedDigestInfo);
      if (isValid) {
        console.log('[BFS-VERIFY] ✅ Manual verification successful');
      } else {
        console.log('[BFS-VERIFY] ❌ Manual verification failed - digest mismatch');
        console.log('[BFS-VERIFY] Expected:', expectedDigestInfo.toString('hex'));
        console.log('[BFS-VERIFY] Got:     ', decrypted.toString('hex'));
      }
      return isValid;
    } catch (manualErr) {
      console.error('[BFS-VERIFY] Manual publicDecrypt also failed:', (manualErr as Error).message);
      return false;
    }
  } catch (err) {
    console.error('[BFS-VERIFY] Checksum verification failed entirely:', err);
    return false;
  }
}
