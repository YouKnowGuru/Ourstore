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
let _privateKey: string | null = null;
let _publicKey: string | null = null;

function normalizeKey(key: string): string {
  // 1. Remove surrounding quotes and trim
  let normalized = key.trim().replace(/^"|"$/g, '').trim();

  // 2. Handle literal escape sequences if present (\n, \r)
  normalized = normalized.replace(/\\n/g, '\n').replace(/\\r/g, '');

  // 3. Normalize all line endings to \n and remove \r
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '');

  // 4. Remove any invisible characters/BOM (keep only printable ASCII and newlines)
  normalized = normalized.replace(/[^\x20-\x7E\n]/g, '');

  console.log(`[BFS] Normalized key (length ${normalized.length}):`);
  console.log(`[BFS] Start: [${normalized.substring(0, 30).replace(/\n/g, '\\n')}]`);
  console.log(`[BFS] End:   [${normalized.substring(normalized.length - 30).replace(/\n/g, '\\n')}]`);
  
  if (normalized.includes('\r')) console.log('[BFS] WARNING: Key still contains \\r carriage returns!');
  if (normalized.includes('"')) console.log('[BFS] WARNING: Key still contains double quotes!');

  return normalized;
}

function joinSplitKey(prefix: string): string | null {
  const parts: string[] = [];
  let i = 1;
  while (process.env[`${prefix}_P${i}`]) {
    // Normalize each part individually before joining
    parts.push(normalizeKey(process.env[`${prefix}_P${i}`]!));
    i++;
  }
  return parts.length > 0 ? parts.join('') : null;
}

export function getPrivateKey(): string {
  if (!_privateKey) {
    // 1. Check for single environment variable or split parts
    const directKey = process.env.BFS_PRIVATE_KEY || joinSplitKey('BFS_PRIVATE_KEY');

    if (directKey && directKey.includes('-----BEGIN')) {
      _privateKey = normalizeKey(directKey);
      console.log('[BFS] Loaded private key from environment variable (single or split)');
      console.log(`[BFS] Private key length: ${_privateKey.length}, starts with: ${_privateKey.substring(0, 20)}..., ends with: ...${_privateKey.substring(_privateKey.length - 20)}`);
      return _privateKey;
    }

    // 2. Fallback to reading from file path
    const keyPath = path.resolve(process.cwd(), BFS_PRIVATE_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS private key not found at ${keyPath} and BFS_PRIVATE_KEY (or _P1, _P2...) env var is not set. ` +
        'Generate an RSA key pair or set the keys correctly.'
      );
    }
    _privateKey = fs.readFileSync(keyPath, 'utf-8');
    console.log('[BFS] Loaded private key from file:', keyPath);
  }
  return _privateKey;
}

export function getPublicKey(): string {
  if (!_publicKey) {
    // 1. Check for single environment variable or split parts
    const directKey = process.env.BFS_PUBLIC_KEY || joinSplitKey('BFS_PUBLIC_KEY');

    if (directKey && directKey.includes('-----BEGIN')) {
      _publicKey = normalizeKey(directKey);
      console.log('[BFS] Loaded public key from environment variable (single or split)');
      console.log(`[BFS] Public key length: ${_publicKey.length}, starts with: ${_publicKey.substring(0, 20)}..., ends with: ...${_publicKey.substring(_publicKey.length - 20)}`);
      return _publicKey;
    }

    // 2. Fallback to reading from file path
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
 * IMPORTANT: BFS Secure requires EXACTLY these fields in THIS order
 * for checksum calculation. bfs_returnUrl and bfs_checkSum are EXCLUDED.
 *
 * Order:
 *  bfs_benfBankCode | bfs_benfId | bfs_benfTxnTime | bfs_msgType |
 *  bfs_orderNo | bfs_paymentDesc | bfs_remitterEmail |
 *  bfs_txnAmount | bfs_txnCurrency | bfs_version
 *
 * @param fields  Key-value map of BFS fields
 * @returns       Pipe-separated source string ready for signing
 */
export function buildSourceString(fields: Record<string, string>): string {
  // Fixed field order as per BFS Secure specification
  const BFS_SOURCE_FIELD_ORDER = [
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

  const values = BFS_SOURCE_FIELD_ORDER.map((key) => fields[key] || '');
  const sourceString = values.join('|');

  console.log('[BFS-DEBUG] Source string field order:', BFS_SOURCE_FIELD_ORDER);
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
  const privateKey = getPrivateKey();
  const signer = crypto.createSign('SHA1');
  signer.update(sourceString);
  signer.end();
  return signer.sign(privateKey, 'hex').toUpperCase();
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
