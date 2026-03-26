import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { refreshToken } = await req.json();

        if (!refreshToken) {
            return NextResponse.json({ message: 'Refresh token is required' }, { status: 400 });
        }

        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(authHeader.split(' ')[1]);
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid access token' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId);
        if (user && user.refreshTokens) {
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            await user.save();
        }

        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
