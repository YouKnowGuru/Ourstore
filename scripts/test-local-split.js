import dotenv from 'dotenv';
import path from 'path';
import { signRequest, getPrivateKey, getPublicKey } from '../lib/bfs/checksum.ts';

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('--- Split Key Local Test ---');
console.log('BFS_PRIVATE_KEY_P1 exists:', !!process.env.BFS_PRIVATE_KEY_P1);
console.log('BFS_PRIVATE_KEY_P2 exists:', !!process.env.BFS_PRIVATE_KEY_P2);
console.log('BFS_PRIVATE_KEY_P3 exists:', !!process.env.BFS_PRIVATE_KEY_P3);
console.log('BFS_PUBLIC_KEY_P1 exists:', !!process.env.BFS_PUBLIC_KEY_P1);

try {
    console.log('\n--- Testing Private Key ---');
    const privateKey = getPrivateKey();
    console.log('Private key loaded successfully.');
    
    const sourceString = "test|data|for|signing";
    const signature = signRequest(sourceString);
    console.log('Signature generated successfully.');

    console.log('\n--- Testing Public Key ---');
    const publicKey = getPublicKey();
    console.log('Public key loaded successfully.');
    
    console.log('\nSUCCESS! Both keys are valid for Node.js crypto.');
} catch (error) {
    console.error('\nFAILED:');
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
}
