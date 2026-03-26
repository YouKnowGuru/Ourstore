import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import WalletTransaction from '@/lib/models/WalletTransaction';
import { getSettings } from '@/lib/models/AppSettings';
import { verifyAccessToken } from '@/lib/services/tokenService';

async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    return await User.findById(decoded.userId);
}

// POST /api/wallet/convert
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { pointsToConvert } = await req.json();
        if (!pointsToConvert || pointsToConvert <= 0) {
            return NextResponse.json({ message: 'Invalid points amount' }, { status: 400 });
        }

        const settings = await getSettings();

        if (pointsToConvert < settings.minRedeemPoints) {
            return NextResponse.json({
                message: `Minimum ${settings.minRedeemPoints} points required to convert`,
            }, { status: 400 });
        }
        if (user.points < pointsToConvert) {
            return NextResponse.json({ message: 'Insufficient points balance' }, { status: 400 });
        }

        const amountInNu = parseFloat((pointsToConvert * settings.pointToNuRate).toFixed(2));

        user.points -= pointsToConvert;
        user.walletBalance = parseFloat((user.walletBalance + amountInNu).toFixed(2));
        user.pointHistory.push({
            type: 'redeem',
            points: pointsToConvert,
            amount: amountInNu,
            reason: 'Converted to wallet balance',
            createdAt: new Date(),
        });
        await user.save();

        await WalletTransaction.create({
            userId: user._id,
            type: 'credit',
            amount: amountInNu,
            points: pointsToConvert,
            description: `Converted ${pointsToConvert} points to Nu. ${amountInNu}`,
        });

        return NextResponse.json({
            message: `Successfully converted ${pointsToConvert} points to Nu. ${amountInNu}`,
            points: user.points,
            walletBalance: user.walletBalance,
            amountAdded: amountInNu,
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
