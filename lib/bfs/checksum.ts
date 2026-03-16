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

function getPrivateKey(): string {
  if (!_privateKey) {
    const keyPath = path.resolve(process.cwd(), BFS_PRIVATE_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS private key not found at ${keyPath}. ` +
        'Generate an RSA key pair or set BFS_PRIVATE_KEY_PATH correctly.'
      );
    }
    _privateKey = fs.readFileSync(keyPath, 'utf-8');
  }
  return _privateKey;
}

function getPublicKey(): string {
  if (!_publicKey) {
    const keyPath = path.resolve(process.cwd(), BFS_PUBLIC_KEY_PATH);
    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `BFS public key not found at ${keyPath}. ` +
        'Obtain the BFS Secure public key from RMA or set BFS_PUBLIC_KEY_PATH correctly.'
      );
    }
    _publicKey = fs.readFileSync(keyPath, 'utf-8');
  }
  return _publicKey;
}

/**
 * Build the BFS source string from a set of fields.
 *
 * Steps:
 *  1. Exclude the `bfs_checkSum` field itself
 *  2. Sort remaining keys alphabetically (case-insensitive)
 *  3. Join the VALUES with pipe "|"
 *
 * @param fields  Key-value map of BFS fields (e.g. bfs_msgType → 'AR')
 * @returns       Pipe-separated source string ready for signing
 */
export function buildSourceString(fields: Record<string, string>): string {
  const sortedKeys = Object.keys(fields)
    .filter((k) => k.toLowerCase() !== 'bfs_checksum')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const sourceString = sortedKeys.map((k) => fields[k]).join('|');
  console.log('[BFS-DEBUG] Source string keys:', sortedKeys);
  console.log('[BFS-DEBUG] Source string:', sourceString);
  return sourceString;
}

/**
 * Sign a source-string with the merchant's RSA private key using SHA1.
 *
 * @param sourceString  The pipe-separated source string
 * @returns             Base64-encoded signature
 */
export function signRequest(sourceString: string): string {
  const privateKey = getPrivateKey();
  const signer = crypto.createSign('SHA1');
  signer.update(sourceString);
  signer.end();
  return signer.sign(privateKey, 'base64');
}

/**
 * Verify a BFS response checksum using BFS Secure's RSA public key.
 *
 * @param sourceString  The pipe-separated source string reconstructed from the response
 * @param checksum      Base64-encoded checksum received from BFS
 * @returns             `true` if signature is valid
 */
export function verifyResponse(sourceString: string, checksum: string): boolean {
  try {
    const publicKey = getPublicKey();
    const verifier = crypto.createVerify('SHA1');
    verifier.update(sourceString);
    verifier.end();
    return verifier.verify(publicKey, checksum, 'base64');
  } catch (err) {
    console.error('[BFS] Checksum verification failed:', err);
    return false;
  }
}
