import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import WalletTransaction from '@/lib/models/WalletTransaction';
import { getSettings } from '@/lib/models/AppSettings';
import { verifyAccessToken } from '@/lib/services/tokenService';

// points/earn is called server-to-server after order/signup success
// It uses a simple userId in body (no Bearer needed for internal calls)
// But must validate the call has a valid user Id
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, action, orderTotal } = await req.json();

        if (!userId || !action) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const [user, settings] = await Promise.all([
            User.findById(userId),
            getSettings(),
        ]);

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        let pointsEarned = 0;
        let reason = '';

        if (action === 'signup') {
            pointsEarned = settings.signupPoints;
            reason = 'Welcome bonus for signing up';
        } else if (action === 'purchase' && orderTotal) {
            pointsEarned = Math.floor(orderTotal * settings.purchasePointRate);
            reason = `Purchase reward (${(settings.purchasePointRate * 100).toFixed(0)}% of Nu. ${orderTotal.toFixed(2)})`;
        } else if (action === 'referral') {
            if (!user.referredBy) return NextResponse.json({ message: 'No referrer found' }, { status: 400 });

            const referrer = await User.findById(user.referredBy);
            if (!referrer) return NextResponse.json({ message: 'Referrer not found' }, { status: 404 });

            // 1. Award Referred Signup Bonus to the new user
            const referredBonus = settings.referredSignupBonus || 0;
            if (referredBonus > 0) {
                user.points += referredBonus;
                user.pointHistory.push({
                    type: 'earn',
                    points: referredBonus,
                    reason: 'Referral signup bonus',
                    createdAt: new Date(),
                });
                await WalletTransaction.create({
                    userId: user._id,
                    type: 'credit',
                    amount: 0,
                    points: referredBonus,
                    description: 'Referral signup bonus',
                });
            }

            // 2. Award Referral Reward to the referrer
            const referralReward = settings.referralRewardPoints || 0;
            if (referralReward > 0) {
                referrer.points += referralReward;
                referrer.pointHistory.push({
                    type: 'earn',
                    points: referralReward,
                    reason: `Referral reward for inviting ${user.fullName}`,
                    createdAt: new Date(),
                });
                await referrer.save();
                await WalletTransaction.create({
                    userId: referrer._id,
                    type: 'credit',
                    amount: 0,
                    points: referralReward,
                    description: `Referral reward for inviting ${user.fullName}`,
                });
            }

            await user.save();
            return NextResponse.json({ 
                message: 'Referral rewards awarded', 
                referredBonus, 
                referralReward,
                totalPoints: user.points 
            });
        } else {
            return NextResponse.json({ message: 'Unknown action or missing orderTotal' }, { status: 400 });
        }

        if (pointsEarned <= 0) {
            return NextResponse.json({ message: 'No points to award', pointsEarned: 0 });
        }

        user.points += pointsEarned;
        user.pointHistory.push({
            type: 'earn',
            points: pointsEarned,
            reason,
            createdAt: new Date(),
        });
        await user.save();

        await WalletTransaction.create({
            userId: user._id,
            type: 'credit',
            amount: 0,
            points: pointsEarned,
            description: reason,
        });

        return NextResponse.json({ message: `Awarded ${pointsEarned} points`, pointsEarned, totalPoints: user.points });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
