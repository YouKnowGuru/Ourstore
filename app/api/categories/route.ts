import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({ isActive: true }).sort({ order: 1 });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
