import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateTokens } from '@/lib/services/tokenService';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, otp } = await req.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        
        // Support multiple sessions (limit to 10)
        if (!user.refreshTokens) user.refreshTokens = [];
        user.refreshTokens.push(refreshToken);
        if (user.refreshTokens.length > 10) {
            user.refreshTokens.shift();
        }
        await user.save();

        // Award signup points (fire and forget)
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/points/earn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id, action: 'signup' }),
        }).catch(console.error);

        // Award referral points if applicable
        if (user.referredBy) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/points/earn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, action: 'referral' }),
            }).catch(console.error);
        }

        return NextResponse.json({
            message: 'Email verified successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                referralCode: user.referralCode,
            },
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
