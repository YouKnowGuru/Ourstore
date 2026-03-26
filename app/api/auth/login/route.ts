import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateTokens } from '@/lib/services/tokenService';
import { generateOTP } from '@/lib/utils/helpers';
import { sendOTPEmail } from '@/lib/services/emailService';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.isVerified) {
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await sendOTPEmail(email, otp, 'verification');
            return NextResponse.json(
                { message: 'Please verify your email first', userId: user._id, needsVerification: true },
                { status: 403 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json({ message: 'Account has been deactivated' }, { status: 403 });
        }

        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        
        // Support multiple sessions (limit to 10)
        if (!user.refreshTokens) user.refreshTokens = [];
        user.refreshTokens.push(refreshToken);
        if (user.refreshTokens.length > 10) {
            user.refreshTokens.shift();
        }
        
        await user.save();

        return NextResponse.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                phone: user.phone,
            },
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
