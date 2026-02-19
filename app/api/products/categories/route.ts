import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';

// GET /api/products/categories
export async function GET(_req: NextRequest) {
    try {
        await connectDB();
        const categories = await Product.distinct('category', { status: 'active' });
        return NextResponse.json(categories);
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
