import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateOTP } from '@/lib/utils/helpers';
import { sendOTPEmail } from '@/lib/services/emailService';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { fullName, email, password, phone } = await req.json();

        if (!fullName || !email || !password) {
            return NextResponse.json({ message: 'fullName, email, and password are required' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.create({ fullName, email, password, phone, otp, otpExpiry });

        let emailSent = true;
        try {
            await sendOTPEmail(email, otp, 'verification');
        } catch (error) {
            console.error('Registration email failed:', error);
            emailSent = false;
        }

        return NextResponse.json(
            {
                message: emailSent
                    ? 'Registration successful. Please verify your email.'
                    : 'Registration successful, but we failed to send the verification email. Please contact support.',
                userId: user._id
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
