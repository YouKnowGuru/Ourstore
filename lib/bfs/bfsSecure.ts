/**
 * BFS Secure — AR / AC / AS Message Builders
 *
 * Handles the creation of Authorization Request (AR) messages,
 * parsing of Authorization Confirmation (AC) responses,
 * and Authorization Status (AS) queries.
 */

import {
  BFS_BENEFICIARY_ID,
  BFS_BANK_CODE,
  BFS_VERSION,
  BFS_PAYMENT_URL,
  BFS_RETURN_URL,
  BFS_STATUS_URL,
  BFS_FIELDS,
  BFS_AC_FIELDS,
  MSG_TYPE,
  DEFAULT_CURRENCY,
  resolveAuthCode,
} from './constants';
import { buildSourceString, signRequest, verifyResponse } from './checksum';

// ── Types ───────────────────────────────────────────────────────────

export interface ARMessageParams {
  orderNo: string;
  amount: number;
  remitterEmail: string;
  paymentDesc: string;
  currency?: string;
}

export interface ACResponseData {
  msgType: string;
  orderNo: string;
  benfId: string;
  benfTxnTime: string;
  txnCurrency: string;
  txnAmount: string;
  remitterName: string;
  remitterBankId: string;
  debitAuthCode: string;
  debitAuthNo: string;
  txnId: string;
  checksum: string;
  isValid: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  statusMessage: string;
}

// ── AR Message ──────────────────────────────────────────────────────

/**
 * Sanitize payment description to only contain BFS-allowed characters.
 * Allowed: alphanumeric, @ / \ ( ) . - _ , & ' and space
 */
function sanitizePaymentDesc(desc: string): string {
  return desc.replace(/[^a-zA-Z0-9@/\\().\-_,&' ]/g, '');
}

/**
 * Create an Authorization Request message for BFS Secure.
 *
 * @returns Object with `fields` (key-value map) and `paymentUrl`
 */
export function createARMessage(params: ARMessageParams) {
  const { orderNo, amount, remitterEmail, paymentDesc, currency } = params;

  const now = new Date();
  const benfTxnTime = formatBfsTxnTime(now);

  // Sanitize payment description for BFS-allowed chars only
  const cleanPaymentDesc = sanitizePaymentDesc(paymentDesc);

  // Build field map (excluding checksum – added after signing)
  // NOTE: bfs_returnUrl is NOT included — BFS rejects extra/unexpected fields
  const fields: Record<string, string> = {
    [BFS_FIELDS.MSG_TYPE]: MSG_TYPE.AR,
    [BFS_FIELDS.BENF_TXN_TIME]: benfTxnTime,
    [BFS_FIELDS.ORDER_NO]: orderNo,
    [BFS_FIELDS.BENF_ID]: BFS_BENEFICIARY_ID,
    [BFS_FIELDS.BENF_BANK_CODE]: BFS_BANK_CODE,
    [BFS_FIELDS.TXN_CURRENCY]: currency || DEFAULT_CURRENCY,
    [BFS_FIELDS.TXN_AMOUNT]: amount.toFixed(2),
    [BFS_FIELDS.REMITTER_EMAIL]: remitterEmail,
    [BFS_FIELDS.PAYMENT_DESC]: cleanPaymentDesc,
    [BFS_FIELDS.VERSION]: BFS_VERSION,
  };

  // Build source string and sign
  const sourceString = buildSourceString(fields);
  const checksum = signRequest(sourceString);

  // Add checksum to field map
  fields[BFS_FIELDS.CHECKSUM] = checksum;

  // Log the complete payload for debugging
  console.log('[BFS] === AR Message Payload ===');
  Object.entries(fields).forEach(([k, v]) => {
    console.log(`[BFS]   ${k} = ${v}`);
  });
  console.log('[BFS] === End Payload ===');

  return {
    fields,
    paymentUrl: BFS_PAYMENT_URL,
    sourceString, // for audit logging
  };
}

// ── AC Response ─────────────────────────────────────────────────────

/**
 * Parse and validate an Authorization Confirmation (AC) response from BFS.
 *
 * @param body  The raw POST body from BFS callback (form-urlencoded or JSON)
 * @returns     Parsed AC data with validity flag
 */
export function parseACResponse(body: Record<string, string>): ACResponseData {
  const msgType = body[BFS_AC_FIELDS.MSG_TYPE] || '';
  const orderNo = body[BFS_AC_FIELDS.ORDER_NO] || '';
  const benfId = body[BFS_AC_FIELDS.BENF_ID] || '';
  const benfTxnTime = body[BFS_AC_FIELDS.BENF_TXN_TIME] || '';
  const txnCurrency = body[BFS_AC_FIELDS.TXN_CURRENCY] || '';
  const txnAmount = body[BFS_AC_FIELDS.TXN_AMOUNT] || '';
  const remitterName = body[BFS_AC_FIELDS.REMITTER_NAME] || '';
  const remitterBankId = body[BFS_AC_FIELDS.REMITTER_BANK_ID] || '';
  const debitAuthCode = body[BFS_AC_FIELDS.DEBIT_AUTH_CODE] || '';
  const debitAuthNo = body[BFS_AC_FIELDS.DEBIT_AUTH_NO] || '';
  const txnId = body[BFS_AC_FIELDS.TXN_ID] || '';
  const checksum = body[BFS_AC_FIELDS.CHECKSUM] || '';

  // Rebuild source string from response fields (excluding checksum)
  const responseFields: Record<string, string> = { ...body };
  delete responseFields[BFS_AC_FIELDS.CHECKSUM];

  const sourceString = buildSourceString(responseFields);
  const isValid = verifyResponse(sourceString, checksum);

  const authResult = resolveAuthCode(debitAuthCode);

  return {
    msgType,
    orderNo,
    benfId,
    benfTxnTime,
    txnCurrency,
    txnAmount,
    remitterName,
    remitterBankId,
    debitAuthCode,
    debitAuthNo,
    txnId,
    checksum,
    isValid,
    status: authResult.status,
    statusMessage: authResult.message,
  };
}

// ── AS Message (Status Query) ───────────────────────────────────────

export interface ASMessageParams {
  orderNo: string;
  benfId?: string;
}

/**
 * Create an Authorization Status (AS) message and send it to BFS.
 *
 * @returns Parsed response from BFS checkStatus endpoint
 */
export async function queryTransactionStatus(params: ASMessageParams) {
  const { orderNo, benfId } = params;

  const fields: Record<string, string> = {
    [BFS_FIELDS.MSG_TYPE]: MSG_TYPE.AS,
    [BFS_FIELDS.ORDER_NO]: orderNo,
    [BFS_FIELDS.BENF_ID]: benfId || BFS_BENEFICIARY_ID,
    [BFS_FIELDS.VERSION]: BFS_VERSION,
  };

  const sourceString = buildSourceString(fields);
  const checksum = signRequest(sourceString);
  fields[BFS_FIELDS.CHECKSUM] = checksum;

  // POST to BFS checkStatus endpoint
  const formBody = new URLSearchParams(fields);

  const response = await fetch(BFS_STATUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString(),
    signal: AbortSignal.timeout(30000), // 30s timeout
  });

  if (!response.ok) {
    throw new Error(`BFS status query failed: HTTP ${response.status} ${response.statusText}`);
  }

  // Parse response — BFS may return form-encoded or JSON
  const contentType = response.headers.get('content-type') || '';
  let responseData: Record<string, string>;

  if (contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    responseData = Object.fromEntries(new URLSearchParams(text));
  }

  return parseACResponse(responseData);
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Format Date to BFS-expected transaction time format: YYYYMMDDHHmmss
 */
function formatBfsTxnTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/**
 * Generate HTML auto-submit form for BFS payment redirect.
 *
 * @param fields    AR message fields (including checksum)
 * @param actionUrl BFS payment URL
 * @returns         Complete HTML document string
 */
export function generateAutoSubmitForm(
  fields: Record<string, string>,
  actionUrl: string
): string {
  const hiddenInputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`
    )
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting to Payment Gateway...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.05);
      border-radius: 24px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      max-width: 420px;
      width: 90%;
    }
    .spinner {
      width: 48px; height: 48px;
      border: 4px solid rgba(255,255,255,0.15);
      border-top-color: #e2a200;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { font-size: 0.875rem; opacity: 0.7; }
    noscript { color: #e2a200; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Redirecting to BFS Secure</h2>
    <p>Please wait while we connect to the payment gateway…</p>
    <noscript><p>JavaScript is required. Please enable it and try again.</p></noscript>
  </div>
  <form id="bfsForm" method="POST" action="${escapeHtml(actionUrl)}" style="display:none;">
      ${hiddenInputs}
  </form>
  <script>document.getElementById('bfsForm').submit();</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
