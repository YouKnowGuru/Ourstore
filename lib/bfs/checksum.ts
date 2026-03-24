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
 * For AR and AS messages, BFS requires a specific FIXED field order.
 * For AC (callbacks), we use alphabetical order of provided keys.
 */
export function buildSourceString(fields: Record<string, string>): string {
  const msgType = fields['bfs_msgType'] || '';

  if (msgType === 'AR') {
    // FIXED ORDER for AR per BFS Documentation - alphabetical by field name
    const AR_ORDER = [
      'bfs_benfBankCode',
      'bfs_benfId',
      'bfs_benfTxnTime',
      'bfs_msgType',
      'bfs_orderNo',
      'bfs_paymentDesc',
      'bfs_remitterEmail',
      'bfs_txnAmount',
      'bfs_txnCurrency',
      'bfs_version',
    ];
    const values = AR_ORDER.map((k) => fields[k] || '');
    const sourceString = values.join('|');
    console.log('[BFS-DEBUG] AR Source String (Fixed Order):', sourceString);
    return sourceString;
  }

  if (msgType === 'AS') {
    // FIXED ORDER for AS (Status Query)
    const AS_ORDER = ['bfs_msgType', 'bfs_orderNo', 'bfs_benfId', 'bfs_version'];
    const values = AS_ORDER.map((k) => fields[k] || '');
    const sourceString = values.join('|');
    console.log('[BFS-DEBUG] AS Source String (Fixed Order):', sourceString);
    return sourceString;
  }

  // Fallback to alphabetical for AC and unknown types
  const keys = Object.keys(fields).filter(
    (k) => k.toLowerCase() !== 'bfs_checksum' && fields[k] !== undefined
  );
  keys.sort((a, b) => a.localeCompare(b));
  const values = keys.map((k) => fields[k] || '');
  const sourceString = values.join('|');

  console.log(`[BFS-DEBUG] ${msgType} Source String (Alphabetical):`, sourceString);
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


/** SHA-256 DigestInfo DER header */
const SHA256_DIGEST_INFO_PREFIX = Buffer.from(
  '3031300d060960864801650304020105000420', 'hex'
);

/**
 * Verify a BFS response checksum using BFS Secure's RSA public key.
 *
 * Tries multiple digest algorithms (SHA-1, SHA-256) and padding schemes
 * to handle unknown BFS signing configuration and OpenSSL 3.0 restrictions.
 */
export function verifyResponse(sourceString: string, checksumHex: string): boolean {
  try {
    if (!checksumHex) {
      console.error('[BFS-VERIFY] No checksum provided');
      return false;
    }
    console.log(`[BFS-VERIFY] Verifying checksum (length: ${checksumHex.length})`);

    // ── Load public key ──────────────────────────────────────────
    const publicKeyRaw = process.env.BFS_PUBLIC_KEY || joinSplitKeyRaw('BFS_PUBLIC_KEY');
    if (!publicKeyRaw) {
      const keyPath = path.resolve(process.cwd(), BFS_PUBLIC_KEY_PATH);
      if (!fs.existsSync(keyPath)) {
        throw new Error('BFS public key not found in env or file');
      }
      const filePem = fs.readFileSync(keyPath, 'utf-8');
      const verifier = crypto.createVerify('RSA-SHA1');
      verifier.update(sourceString, 'utf8');
      verifier.end();
      return verifier.verify(filePem, Buffer.from(checksumHex, 'hex'));
    }

    // Load as DER KeyObject
    const base64 = extractBase64FromPEM(publicKeyRaw);
    const derBuffer = Buffer.from(base64, 'base64');
    console.log(`[BFS-VERIFY] Public key DER: ${derBuffer.length} bytes`);

    let publicKeyObj: crypto.KeyObject;
    try {
      publicKeyObj = crypto.createPublicKey({ key: derBuffer, format: 'der', type: 'spki' });
      console.log('[BFS-VERIFY] ✅ Public KeyObject created (SPKI)');
    } catch {
      try {
        publicKeyObj = crypto.createPublicKey({ key: derBuffer, format: 'der', type: 'pkcs1' });
        console.log('[BFS-VERIFY] ✅ Public KeyObject created (PKCS#1)');
      } catch (err2) {
        console.error('[BFS-VERIFY] ❌ Failed to create KeyObject:', (err2 as Error).message);
        return false;
      }
    }

    const signatureBuffer = Buffer.from(checksumHex, 'hex');

    // ── Try createVerify with multiple algorithms ────────────────
    const algorithms = ['sha1', 'sha256', 'RSA-SHA1', 'RSA-SHA256'];
    for (const algo of algorithms) {
      try {
        const verifier = crypto.createVerify(algo);
        verifier.update(sourceString, 'utf8');
        verifier.end();
        const isValid = verifier.verify(publicKeyObj, signatureBuffer);
        if (isValid) {
          console.log(`[BFS-VERIFY] ✅ Verified via createVerify(${algo})`);
          return true;
        }
      } catch (err) {
        console.log(`[BFS-VERIFY] createVerify(${algo}) failed: ${(err as Error).message}`);
      }
    }

    // ── Try crypto.verify with multiple algorithms + padding ─────
    for (const algo of ['sha1', 'sha256']) {
      for (const padding of [crypto.constants.RSA_PKCS1_PADDING, crypto.constants.RSA_PKCS1_PSS_PADDING]) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const opts: any = { key: publicKeyObj, padding };
          if (padding === crypto.constants.RSA_PKCS1_PSS_PADDING) {
            opts.saltLength = crypto.constants.RSA_PSS_SALTLEN_AUTO;
          }
          const isValid = crypto.verify(algo, Buffer.from(sourceString, 'utf8'), opts, signatureBuffer);
          if (isValid) {
            console.log(`[BFS-VERIFY] ✅ Verified via crypto.verify(${algo}, padding:${padding})`);
            return true;
          }
        } catch {
          // Continue silently
        }
      }
    }

    // ── RSA_NO_PADDING: raw decrypt + scan for DigestInfo ────────
    console.log('[BFS-VERIFY] Trying RSA_NO_PADDING with manual DigestInfo scanning...');

    const rawDecrypted = crypto.publicDecrypt(
      { key: publicKeyObj, padding: crypto.constants.RSA_NO_PADDING },
      signatureBuffer
    );

    console.log(`[BFS-VERIFY] Raw decrypted (${rawDecrypted.length} bytes)`);
    console.log(`[BFS-VERIFY] First 40 bytes: ${rawDecrypted.slice(0, 40).toString('hex')}`);
    console.log(`[BFS-VERIFY] Byte[0]=0x${rawDecrypted[0].toString(16)}, Byte[1]=0x${rawDecrypted[1].toString(16)}`);

    // Build expected DigestInfos for both SHA-1 and SHA-256
    const digestInfos: Record<string, Buffer> = {
      sha1: Buffer.concat([SHA1_DIGEST_INFO_PREFIX, crypto.createHash('sha1').update(sourceString, 'utf8').digest()]),
      sha256: Buffer.concat([SHA256_DIGEST_INFO_PREFIX, crypto.createHash('sha256').update(sourceString, 'utf8').digest()]),
    };

    // Check standard PKCS#1 v1.5 structure: 0x00 0x01 [0xFF...] 0x00 [DigestInfo]
    if (rawDecrypted[0] === 0x00 && rawDecrypted[1] === 0x01) {
      let separatorIdx = -1;
      for (let i = 2; i < rawDecrypted.length; i++) {
        if (rawDecrypted[i] === 0x00) { separatorIdx = i; break; }
        if (rawDecrypted[i] !== 0xff) break;
      }
      if (separatorIdx > 0) {
        const recovered = rawDecrypted.slice(separatorIdx + 1);
        for (const [algo, expected] of Object.entries(digestInfos)) {
          if (recovered.equals(expected)) {
            console.log(`[BFS-VERIFY] ✅ Verified via PKCS#1 v1.5 structure (${algo})`);
            return true;
          }
        }
        console.log('[BFS-VERIFY] PKCS#1 v1.5 structure found but DigestInfo does not match');
        console.log('[BFS-VERIFY] Recovered:', recovered.toString('hex').substring(0, 80));
      }
    }

    // Scan entire decrypted buffer for any matching DigestInfo
    for (const [algo, expected] of Object.entries(digestInfos)) {
      for (let i = 0; i <= rawDecrypted.length - expected.length; i++) {
        const slice = rawDecrypted.slice(i, i + expected.length);
        if (slice.equals(expected)) {
          console.log(`[BFS-VERIFY] ✅ Found matching ${algo} DigestInfo at offset ${i}`);
          return true;
        }
      }
    }

    // Also try PKCS1_PADDING with publicDecrypt
    try {
      const pkcs1Decrypted = crypto.publicDecrypt(
        { key: publicKeyObj, padding: crypto.constants.RSA_PKCS1_PADDING },
        signatureBuffer
      );
      console.log(`[BFS-VERIFY] PKCS1 decrypted: ${pkcs1Decrypted.toString('hex').substring(0, 80)}...`);
      for (const [algo, expected] of Object.entries(digestInfos)) {
        if (pkcs1Decrypted.equals(expected)) {
          console.log(`[BFS-VERIFY] ✅ Verified via PKCS1 padding (${algo})`);
          return true;
        }
      }
    } catch (err) {
      console.log('[BFS-VERIFY] PKCS1 decryption failed:', (err as Error).message);
    }

    // Log raw hash comparisons for debugging
    console.log('[BFS-VERIFY] ❌ All verification methods failed');
    console.log('[BFS-VERIFY] Expected SHA1 hash:', crypto.createHash('sha1').update(sourceString).digest('hex'));
    console.log('[BFS-VERIFY] Expected SHA256 hash:', crypto.createHash('sha256').update(sourceString).digest('hex'));
    console.log('[BFS-VERIFY] Full raw decrypted:', rawDecrypted.toString('hex'));
    return false;
  } catch (err) {
    console.error('[BFS-VERIFY] ❌ Verification failed:', err);
    return false;
  }
}
