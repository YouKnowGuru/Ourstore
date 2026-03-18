import mongoose from 'mongoose';
import dns from 'dns';

// Force Google DNS to bypass potential local DNS issues in the Node process
dns.setServers(['8.8.8.8']);
console.log('[DEBUG-DNS] DNS servers set to 8.8.8.8 in lib/mongodb.ts');

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI?.trim();

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
