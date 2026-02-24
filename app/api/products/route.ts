import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';
import { uploadToCloudinary } from '@/lib/services/uploadService';

// GET /api/products - list products with filters
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 12);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const isCustomizable = searchParams.get('isCustomizable');
        const isFeatured = searchParams.get('isFeatured');
        const status = searchParams.get('status') || 'active';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = { status };
        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (isCustomizable !== null) query.isCustomizable = isCustomizable === 'true';
        if (isFeatured !== null) query.isFeatured = isFeatured === 'true';
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) query.$text = { $search: search };

        const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(limit)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        return NextResponse.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// POST /api/products - create product (admin only)
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyAccessToken(authHeader.split(' ')[1]);
        if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

        const admin = await User.findById(decoded.userId);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const contentType = req.headers.get('content-type') || '';
        let data: any;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            data = Object.fromEntries(formData.entries());

            // Handle array and boolean fields from FormData
            if (data.tags && typeof data.tags === 'string') {
                data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
            }
            if (data.isFeatured) data.isFeatured = data.isFeatured === 'true';
            if (data.isCustomizable) data.isCustomizable = data.isCustomizable === 'true';
            if (data.price) data.price = Number(data.price);
            if (data.discountPrice) data.discountPrice = Number(data.discountPrice);
            if (data.stock) data.stock = Number(data.stock);

            const images = formData.getAll('images') as File[];
            if (images.length > 0) {
                const uploadPromises = images.map(async (file) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
                    return uploadToCloudinary(base64Image, 'products');
                });
                data.images = await Promise.all(uploadPromises);
            }

            // Handle nested customizationOptions if present
            if (data.customizationOptions && typeof data.customizationOptions === 'string') {
                try {
                    data.customizationOptions = JSON.parse(data.customizationOptions);
                } catch (e) {
                    console.error("Error parsing customizationOptions:", e);
                }
            }
        } else {
            data = await req.json();
        }

        const product = await Product.create(data);

        return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
