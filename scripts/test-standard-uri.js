
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Construct the standard connection string based on verified hostnames
const USERS = 'gururubhai25_db_user';
const PASS = 'rJjCThDmzpbsrEwJ';
const HOSTS = [
    'ac-qc71hhb-shard-00-00.7trqccn.mongodb.net:27017',
    'ac-qc71hhb-shard-00-01.7trqccn.mongodb.net:27017',
    'ac-qc71hhb-shard-00-02.7trqccn.mongodb.net:27017'
].join(',');

const standardUri = `mongodb://${USERS}:${PASS}@${HOSTS}/ourstore?ssl=true&replicaSet=atlas-qc71hhb-shard-0&authSource=admin&retryWrites=true&w=majority`;

async function test() {
    try {
        console.log('Testing Standard URI:', standardUri.replace(PASS, '****'));
        await mongoose.connect(standardUri);
        console.log('SUCCESS! Connected via standard URI.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('FAILED Standard URI test:', error.message);
    }
    process.exit(0);
}

test();
