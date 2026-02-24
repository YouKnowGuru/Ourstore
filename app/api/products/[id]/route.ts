import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';
import { uploadToCloudinary } from '@/lib/services/uploadService';

// GET /api/products/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const reviews = await Review.find({ productId: id })
            .populate('userId', 'fullName profilePicture')
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({ product, reviews });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

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
                const uploadedImages = await Promise.all(uploadPromises);

                // If we have existing images in data.images (sent as strings), combine them
                const existingImages = formData.getAll('existingImages') as string[];
                data.images = [...existingImages, ...uploadedImages];
            } else {
                // If no new images, just use existing ones
                data.images = formData.getAll('existingImages') as string[];
            }

            if (data.customizationOptions && typeof data.customizationOptions === 'string') {
                data.customizationOptions = JSON.parse(data.customizationOptions);
            }
        } else {
            data = await req.json();
        }

        const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product updated successfully', product });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/products/[id] - soft delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

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

        const product = await Product.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
