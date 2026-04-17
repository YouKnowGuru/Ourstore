import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const position = searchParams.get('position');
        const query: any = { isActive: true };
        if (position) query.position = position;
        
        const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
        return NextResponse.json(banners);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
