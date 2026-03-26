import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getSettings } from '@/lib/models/AppSettings';
import { verifyAccessToken } from '@/lib/services/tokenService';

async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    return await User.findById(decoded.userId);
}

// POST /api/wallet/apply — validate and compute wallet discount for checkout
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { cartTotal, walletToUse } = await req.json();
        if (!cartTotal || cartTotal <= 0 || !walletToUse || walletToUse <= 0) {
            return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
        }

        if (user.walletBalance <= 0) {
            return NextResponse.json({ message: 'No wallet balance available' }, { status: 400 });
        }

        const settings = await getSettings();

        let applicableAmount = Math.min(walletToUse, user.walletBalance);
        const maxAllowed = parseFloat(((cartTotal * settings.maxRedeemPercentage) / 100).toFixed(2));
        applicableAmount = parseFloat(Math.min(applicableAmount, maxAllowed).toFixed(2));
        const finalAmount = parseFloat((cartTotal - applicableAmount).toFixed(2));

        return NextResponse.json({
            walletBalance: user.walletBalance,
            applicableDiscount: applicableAmount,
            finalAmount,
            maxAllowed,
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
