import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';
import { sendEmail } from '@/lib/services/emailService';

async function getAdminUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') return null;
    return user;
}

// POST /api/messages/[id]/reply - admin only
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { reply } = await req.json();
        const message = await Message.findById(id);
        if (!message) return NextResponse.json({ message: 'Message not found' }, { status: 404 });

        // Send email reply
        const emailResult = await sendEmail(
            message.email,
            `Re: ${message.subject}`,
            `<div><p>${reply}</p><hr/><p>Original message from ${message.name}:</p><blockquote>${message.message}</blockquote></div>`
        );

        if (!emailResult.success) {
            console.error('Failed to send email reply:', emailResult.error);
        }

        message.isRead = true;
        await message.save();

        return NextResponse.json({ message: 'Reply sent successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
