import dotenv from 'dotenv';
import path from 'path';
import { signRequest } from '../lib/bfs/checksum.ts';

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('--- Split Key Local Test ---');
console.log('BFS_PRIVATE_KEY_P1 exists:', !!process.env.BFS_PRIVATE_KEY_P1);
console.log('BFS_PRIVATE_KEY_P2 exists:', !!process.env.BFS_PRIVATE_KEY_P2);
console.log('BFS_PRIVATE_KEY_P3 exists:', !!process.env.BFS_PRIVATE_KEY_P3);

try {
    const sourceString = "test|data|for|signing";
    const signature = signRequest(sourceString);
    console.log('\nSUCCESS! Signature generated.');
    console.log('Signature length:', signature.length);
    console.log('Signature (base64):', signature);
} catch (error) {
    console.error('\nFAILED to generate signature:');
    console.error(error.message);
    process.exit(1);
}
