/**
 * BFS Secure Payment Gateway — Constants
 * Royal Monetary Authority of Bhutan
 */

// ── BFS Secure Endpoints ────────────────────────────────────────────
export const BFS_PAYMENT_URL =
  process.env.BFS_PAYMENT_URL || 'https://sit.bfs.com/BFSSecure/PaymentRequest';

export const BFS_STATUS_URL =
  process.env.BFS_STATUS_URL || 'https://bfssecure.rma.org.bt/BFSSecure/checkStatus';

export const BFS_RETURN_URL =
  process.env.BFS_RETURN_URL || 'http://localhost:3000/api/payment/callback';

// ── Merchant Config ─────────────────────────────────────────────────
export const BFS_BENEFICIARY_ID = process.env.BFS_BENEFICIARY_ID || '';
export const BFS_BANK_CODE = process.env.BFS_BANK_CODE || '';
export const BFS_VERSION = process.env.BFS_VERSION || '2.0';

// ── Key Paths ───────────────────────────────────────────────────────
export const BFS_PRIVATE_KEY_PATH = process.env.BFS_PRIVATE_KEY_PATH || './keys/merchant_private.pem';
export const BFS_PUBLIC_KEY_PATH = process.env.BFS_PUBLIC_KEY_PATH || './keys/bfs_public.pem';

// ── AR Message Field Names ──────────────────────────────────────────
export const BFS_FIELDS = {
  MSG_TYPE: 'bfs_msgType',
  BENF_TXN_TIME: 'bfs_benfTxnTime',
  ORDER_NO: 'bfs_orderNo',
  BENF_ID: 'bfs_benfId',
  BENF_BANK_CODE: 'bfs_benfBankCode',
  TXN_CURRENCY: 'bfs_txnCurrency',
  TXN_AMOUNT: 'bfs_txnAmount',
  REMITTER_EMAIL: 'bfs_remitterEmail',
  PAYMENT_DESC: 'bfs_paymentDesc',
  VERSION: 'bfs_version',
  CHECKSUM: 'bfs_checkSum',
} as const;

// ── AC Response Field Names ─────────────────────────────────────────
export const BFS_AC_FIELDS = {
  MSG_TYPE: 'bfs_msgType',
  ORDER_NO: 'bfs_orderNo',
  BENF_ID: 'bfs_benfId',
  BENF_TXN_TIME: 'bfs_benfTxnTime',
  TXN_CURRENCY: 'bfs_txnCurrency',
  TXN_AMOUNT: 'bfs_txnAmount',
  REMITTER_NAME: 'bfs_remitterName',
  REMITTER_BANK_ID: 'bfs_remitterBankId',
  DEBIT_AUTH_CODE: 'bfs_debitAuthCode',
  DEBIT_AUTH_NO: 'bfs_debitAuthNo',
  TXN_ID: 'bfs_txnId',
  CHECKSUM: 'bfs_checkSum',
} as const;

// ── Message Types ───────────────────────────────────────────────────
export const MSG_TYPE = {
  AR: 'AR',  // Authorization Request
  AC: 'AC',  // Authorization Confirmation
  AS: 'AS',  // Authorization Status
} as const;

// ── Transaction Currency ────────────────────────────────────────────
export const DEFAULT_CURRENCY = 'BTN';

// ── Debit Auth Code Response Map ────────────────────────────────────
export const DEBIT_AUTH_CODES: Record<string, { status: 'SUCCESS' | 'FAILED' | 'PENDING'; message: string }> = {
  '0000': { status: 'SUCCESS', message: 'Transaction approved' },
  '0001': { status: 'PENDING', message: 'Transaction pending' },
  '1001': { status: 'FAILED', message: 'Transaction declined by bank' },
  '1002': { status: 'FAILED', message: 'Insufficient funds' },
  '1003': { status: 'FAILED', message: 'Invalid card/account number' },
  '1004': { status: 'FAILED', message: 'Card expired' },
  '1005': { status: 'FAILED', message: 'Transaction timeout' },
  '1006': { status: 'FAILED', message: 'Authentication failed' },
  '1007': { status: 'FAILED', message: 'Transaction cancelled by user' },
  '1008': { status: 'FAILED', message: 'Duplicate transaction' },
  '9999': { status: 'FAILED', message: 'System error at payment gateway' },
};

/**
 * Look up the result for a given debitAuthCode.
 * Falls back to generic failure if code is unrecognised.
 */
export function resolveAuthCode(code: string) {
  return (
    DEBIT_AUTH_CODES[code] ?? {
      status: 'FAILED' as const,
      message: `Unknown auth code: ${code}`,
    }
  );
}
