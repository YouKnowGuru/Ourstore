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
let _publicKey: string | null = null;

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

/**
 * Normalize a PEM public key string for verification.
 */
function normalizePublicKey(key: string): string {
  let s = key.trim().replace(/^"|"$/g, '').trim();
  s = s.replace(/\\n/g, '\n').replace(/\\r/g, '');
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '');
  s = s.replace(/[^\x20-\x7E\n]/g, '');

  const headerMatch = s.match(/-----BEGIN [A-Z ]+-----/);
  const footerMatch = s.match(/-----END [A-Z ]+-----/);
  if (headerMatch && footerMatch) {
    const header = headerMatch[0];
    const footer = footerMatch[0];
    const base64Part = s.substring(
      s.indexOf(header) + header.length,
      s.indexOf(footer)
    );
    const cleanBase64 = base64Part.replace(/\s+/g, '');
    const lines = cleanBase64.match(/.{1,64}/g) || [];
    s = `${header}\n${lines.join('\n')}\n${footer}\n`;
  }
  return s;
}

export function getPublicKey(): string {
  if (!_publicKey) {
    const directKey = process.env.BFS_PUBLIC_KEY || joinSplitKeyRaw('BFS_PUBLIC_KEY');

    if (directKey && directKey.includes('-----BEGIN')) {
      _publicKey = normalizePublicKey(directKey);
      console.log('[BFS] Loaded public key from environment variable');
      return _publicKey;
    }

    const keyPath = path.resolve(process.cwd(), BFS_PUBLIC_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS public key not found at ${keyPath} and BFS_PUBLIC_KEY (or _P1, _P2...) env var is not set. ` +
        'Obtain the BFS Secure public key from RMA or set the keys correctly.'
      );
    }
    _publicKey = fs.readFileSync(keyPath, 'utf-8');
    console.log('[BFS] Loaded public key from file:', keyPath);
  }
  return _publicKey;
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
 * Sign a source-string with the merchant's RSA private key using SHA1.
 *
 * @param sourceString  The pipe-separated source string
 * @returns             Uppercase Hex-encoded signature
 */
export function signRequest(sourceString: string): string {
  const keyObj = getPrivateKeyObject();
  const signer = crypto.createSign('SHA1');
  signer.update(sourceString);
  signer.end();
  return signer.sign(keyObj, 'hex').toUpperCase();
}

/**
 * Verify a BFS response checksum using BFS Secure's RSA public key.
 *
 * @param sourceString  The pipe-separated source string reconstructed from the response
 * @param checksumHex   Hex-encoded checksum received from BFS
 * @returns             `true` if signature is valid
 */
export function verifyResponse(sourceString: string, checksumHex: string): boolean {
  try {
    const publicKey = getPublicKey();
    const verifier = crypto.createVerify('SHA1');
    verifier.update(sourceString);
    verifier.end();
    return verifier.verify(publicKey, checksumHex, 'hex');
  } catch (err) {
    console.error('[BFS] Checksum verification failed:', err);
    return false;
  }
}
