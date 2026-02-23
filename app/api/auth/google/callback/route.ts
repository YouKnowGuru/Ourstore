import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateTokens } from '@/lib/services/tokenService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=Google auth failed', req.url));
    }

    try {
        const { origin } = new URL(req.url);

        // 1. Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || `${origin}/api/auth/google/callback`,
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenResponse.data;

        // 2. Get user info from Google
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const googleUser = userResponse.data;

        await connectDB();

        // 3. Find or Create user
        let user = await User.findOne({
            $or: [{ googleId: googleUser.id }, { email: googleUser.email }]
        });

        if (!user) {
            user = await User.create({
                fullName: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.id,
                profilePicture: googleUser.picture,
                isVerified: true,
                isActive: true,
            });
        } else if (!user.googleId) {
            // Update existing user with googleId
            user.googleId = googleUser.id;
            if (!user.profilePicture) user.profilePicture = googleUser.picture;
            user.isVerified = true;
            await user.save();
        }

        // 4. Generate our JWT tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // 5. Redirect to frontend callback page with tokens
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || origin;
        const redirectUrl = new URL('/auth-callback', frontendUrl);
        redirectUrl.searchParams.set('token', accessToken);
        redirectUrl.searchParams.set('refreshToken', refreshToken);
        redirectUrl.searchParams.set('user', JSON.stringify({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        }));

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error: any) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        return NextResponse.redirect(new URL('/login?error=Google authentication failed', req.url));
    }
}
