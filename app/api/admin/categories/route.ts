import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';
import { uploadToCloudinary } from '@/lib/services/uploadService';

export const dynamic = 'force-dynamic';

async function getAdminUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') return null;
    return user;
}

// GET /api/admin/categories
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const categories = await Category.find().sort({ order: 1 });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const contentType = req.headers.get('content-type') || '';
        let data: any;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            data = Object.fromEntries(formData.entries());

            if (data.order) data.order = parseInt(data.order as string, 10);
            
            const imageFile = formData.get('imageFile') as File;
            if (imageFile && imageFile.size > 0) {
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
                data.image = await uploadToCloudinary(base64Image, 'categories');
            }
        } else {
            data = await req.json();
        }

        const category = await Category.create(data);
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
