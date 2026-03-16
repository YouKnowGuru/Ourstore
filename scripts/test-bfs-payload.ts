import fs from 'fs';
import crypto from 'crypto';

// Recreate the exact logic from the Next.js backend
function buildSourceString(fields: Record<string, string>, type: 'AR' | 'AC' | 'AS' = 'AR') {
  const AR_ORDER = [
    'bfs_benfBankCode',
    'bfs_benfId',
    'bfs_benfTxnTime',
    'bfs_remitterEmail',
    'bfs_msgType',
    'bfs_orderNo',
    'bfs_paymentDesc',
    'bfs_txnAmount',
    'bfs_txnCurrency',
    'bfs_version'
  ];
  return AR_ORDER.map((key) => fields[key] || '').join('|');
}

function runSim() {
  const pk = fs.readFileSync('./keys/merchant_private.pem', 'utf8');
  
  const fields = {
    bfs_msgType: 'AR',
    bfs_benfTxnTime: '20260316175149',
    bfs_orderNo: 'BFSW1C195C',
    bfs_benfId: 'BE10000281',
    bfs_benfBankCode: '642064828',
    bfs_txnCurrency: 'BTN',
    bfs_txnAmount: '465.00',
    bfs_remitterEmail: 'mcsgang5@gmail.com',
    bfs_paymentDesc: 'Order OSMMT4I3I3K1RN',
    bfs_version: '2.0'
  };

  const sourceString = buildSourceString(fields);
  console.log('--- STRICT EXPECTED ---');
  console.log('SRC:', sourceString);
  
  const signer = crypto.createSign('SHA1');
  signer.update(sourceString);
  signer.end();
  const signature = signer.sign(pk, 'base64');
  console.log('SIG:', signature);

  console.log('\n--- HOW THE TEST DID IT ---');
  // How the test script e469325f... worked
  const testSrc = '642064828|BE10000281|20260316152733|test@example.com|AR|TEST613323|Test Payment|100.50|BTN|2.0';
  const testSigner = crypto.createSign('SHA1');
  testSigner.update(testSrc);
  testSigner.end();
  const testSig = testSigner.sign(pk, 'base64');
  console.log('SRC:', testSrc);
  console.log('SIG:', testSig);
}

runSim();
