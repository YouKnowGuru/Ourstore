import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateTokens, verifyRefreshToken } from '@/lib/services/tokenService';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { refreshToken } = await req.json();

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
        }

        const tokens = generateTokens(user._id.toString());
        
        // Replace the old refresh token with the new one
        const tokenIndex = user.refreshTokens.indexOf(refreshToken);
        if (tokenIndex !== -1) {
            user.refreshTokens[tokenIndex] = tokens.refreshToken;
        } else {
            user.refreshTokens.push(tokens.refreshToken);
        }
        
        // Keep tokens list manageable
        if (user.refreshTokens.length > 10) {
            user.refreshTokens.shift();
        }
        
        await user.save();

        return NextResponse.json(tokens);
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
