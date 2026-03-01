import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        env: {
            NODE_ENV: process.env.NODE_ENV || 'not set',
            MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'NOT SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
        },
    });
}
