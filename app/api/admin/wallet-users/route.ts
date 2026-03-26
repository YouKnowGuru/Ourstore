import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import WalletTransaction from '@/lib/models/WalletTransaction';
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

// GET /api/admin/wallet-users
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const users = await User.find({ role: 'user' })
            .select('fullName email points walletBalance createdAt')
            .sort({ points: -1 })
            .limit(100);

        return NextResponse.json({ users });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PUT /api/admin/wallet-users — adjust a user's points or wallet
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { userId, pointsAdjustment, walletAdjustment, reason } = await req.json();
        if (!userId) return NextResponse.json({ message: 'userId is required' }, { status: 400 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (pointsAdjustment !== undefined && pointsAdjustment !== 0) {
            const newPoints = user.points + pointsAdjustment;
            if (newPoints < 0) return NextResponse.json({ message: 'Cannot reduce points below 0' }, { status: 400 });
            user.points = newPoints;
            user.pointHistory.push({
                type: pointsAdjustment > 0 ? 'earn' : 'redeem',
                points: Math.abs(pointsAdjustment),
                reason: reason || `Admin adjustment by ${admin.fullName}`,
                createdAt: new Date(),
            });
            await WalletTransaction.create({
                userId: user._id,
                type: 'credit',
                amount: 0,
                points: pointsAdjustment,
                description: reason || `Admin manual points adjustment`,
            });
        }

        if (walletAdjustment !== undefined && walletAdjustment !== 0) {
            const newBalance = parseFloat((user.walletBalance + walletAdjustment).toFixed(2));
            if (newBalance < 0) return NextResponse.json({ message: 'Cannot reduce wallet below 0' }, { status: 400 });
            user.walletBalance = newBalance;
            await WalletTransaction.create({
                userId: user._id,
                type: walletAdjustment > 0 ? 'credit' : 'debit',
                amount: Math.abs(walletAdjustment),
                description: reason || `Admin manual wallet adjustment`,
            });
        }

        await user.save();
        return NextResponse.json({ message: 'User balance updated', points: user.points, walletBalance: user.walletBalance });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
