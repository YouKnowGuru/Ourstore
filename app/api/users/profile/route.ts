import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';

async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    return await User.findById(decoded.userId);
}

// GET /api/users/profile
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const fullUser = await User.findById(user._id).select('-password -otp -otpExpiry -refreshToken');
        
        // Lazy-initialize referral code for existing users
        if (fullUser && !fullUser.referralCode) {
            fullUser.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await fullUser.save();
        }

        return NextResponse.json(fullUser);
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PATCH /api/users/profile - update profile
export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { fullName, phone } = await req.json();
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        await user.save();

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: { 
                id: user._id, 
                fullName: user.fullName, 
                email: user.email, 
                phone: user.phone, 
                profilePicture: user.profilePicture,
                referralCode: user.referralCode
            },
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
