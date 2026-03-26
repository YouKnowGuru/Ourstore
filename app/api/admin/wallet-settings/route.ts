import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AppSettings, { getSettings } from '@/lib/models/AppSettings';
import { verifyAccessToken } from '@/lib/services/tokenService';

async function getAdminUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') return null;
    return user;
}

// GET /api/admin/wallet-settings
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const settings = await getSettings();
        return NextResponse.json({ settings });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PUT /api/admin/wallet-settings
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { 
            pointToNuRate, 
            minRedeemPoints, 
            maxRedeemPercentage, 
            signupPoints, 
            purchasePointRate,
            referralRewardPoints,
            referredSignupBonus 
        } = await req.json();

        let settings = await AppSettings.findOne();
        if (!settings) settings = await AppSettings.create({});

        if (pointToNuRate !== undefined) settings.pointToNuRate = pointToNuRate;
        if (minRedeemPoints !== undefined) settings.minRedeemPoints = minRedeemPoints;
        if (maxRedeemPercentage !== undefined) settings.maxRedeemPercentage = maxRedeemPercentage;
        if (signupPoints !== undefined) settings.signupPoints = signupPoints;
        if (purchasePointRate !== undefined) settings.purchasePointRate = purchasePointRate;
        if (referralRewardPoints !== undefined) settings.referralRewardPoints = referralRewardPoints;
        if (referredSignupBonus !== undefined) settings.referredSignupBonus = referredSignupBonus;

        await settings.save();
        return NextResponse.json({ message: 'Settings updated', settings });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
