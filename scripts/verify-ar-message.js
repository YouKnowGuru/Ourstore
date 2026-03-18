import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createARMessage } from '../lib/bfs/bfsSecure.ts';

console.log('=== BFS AR Message Verification ===\n');

const result = createARMessage({
    orderNo: 'ORDER123456',
    amount: 1.00,
    remitterEmail: 'test@gmail.com',
    paymentDesc: 'ProductPayment',
});

console.log('\n=== Expected Form Structure ===');
console.log('Payment URL:', result.paymentUrl);
console.log('\nFields:');
Object.entries(result.fields).forEach(([k, v]) => {
    console.log(`  <input name="${k}" value="${v}" />`);
});

console.log('\n=== Verification Checklist ===');
const f = result.fields;
console.log('✅ bfs_msgType = AR:', f.bfs_msgType === 'AR');
console.log('✅ bfs_benfId = BE10000281:', f.bfs_benfId === 'BE10000281');
console.log('✅ bfs_benfBankCode = 01:', f.bfs_benfBankCode === '01');
console.log('✅ bfs_txnCurrency = BTN:', f.bfs_txnCurrency === 'BTN');
console.log('✅ bfs_txnAmount = 1.00:', f.bfs_txnAmount === '1.00');
console.log('✅ bfs_version = 1.0:', f.bfs_version === '1.0');
console.log('✅ bfs_checkSum present:', !!f.bfs_checkSum && f.bfs_checkSum.length > 10);
console.log('✅ bfs_benfTxnTime format (14 digits):', /^\d{14}$/.test(f.bfs_benfTxnTime));

// Verify source string does NOT contain return URL
console.log('✅ Source string excludes returnUrl:', !result.sourceString.includes('localhost'));
console.log('✅ Checksum is hex uppercase:', /^[0-9A-F]+$/.test(result.fields.bfs_checkSum));
console.log('\nSample Checksum generated:');
console.log(result.fields.bfs_checkSum);
