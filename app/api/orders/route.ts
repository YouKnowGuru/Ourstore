import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { verifyAccessToken } from '@/lib/services/tokenService';
import { generateOrderNumber } from '@/lib/utils/helpers';
import { sendOrderConfirmation } from '@/lib/services/emailService';
import User from '@/lib/models/User';
import WalletTransaction from '@/lib/models/WalletTransaction';

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    return await User.findById(decoded.userId);
}

// GET /api/orders
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 10);
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};
        if (user.role !== 'admin') query.userId = user._id;
        if (status) query.orderStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('items.productId', 'images')
            .populate('userId', 'fullName email phone');

        const count = await Order.countDocuments(query);

        return NextResponse.json({ orders, totalPages: Math.ceil(count / limit), currentPage: page, total: count });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// POST /api/orders
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { items, shippingAddress, paymentMethod, guestInfo, isGuest = false, notes, walletUsed = 0 } = body;
        console.log('[ORDERS] Received POST body:', JSON.stringify({ items: items?.length, paymentMethod, isGuest, hasShipping: !!shippingAddress, walletUsed }));

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return NextResponse.json({ message: `Product not found: ${item.productId}` }, { status: 404 });
            if (product.stock < item.quantity) {
                console.log('[ORDERS] Stock check failed:', { title: product.title, stock: product.stock, requested: item.quantity });
                return NextResponse.json({ message: `Insufficient stock for ${product.title}. Available: ${product.stock}` }, { status: 400 });
            }

            // Keep using discount price if available, regardless of wallet usage
            const price = product.discountPrice || product.price;
            subtotal += price * item.quantity;
            orderItems.push({ productId: product._id, title: product.title, price, quantity: item.quantity, customization: item.customization || {}, image: product.images[0] });

            product.stock -= item.quantity;
            product.salesCount += item.quantity;
            await product.save();
        }

        const shippingFee = subtotal > 1000 ? 0 : 150;
        const tax = 0;
        const total = subtotal + shippingFee - walletUsed;
        const orderNumber = generateOrderNumber();

        // Get user if authenticated
        let userId: string | undefined = undefined;
        let userEmail: string | undefined = undefined;
        if (!isGuest) {
            const authHeader = req.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const decoded = verifyAccessToken(authHeader.split(' ')[1]);
                if (decoded) {
                    const user = await User.findById(decoded.userId);
                    if (user) { userId = user._id.toString(); userEmail = user.email; }
                }
            }
        }

        // Deduct from wallet if used
        if (walletUsed > 0 && userId) {
            const user = await User.findById(userId);
            if (!user || user.walletBalance < walletUsed) {
                return NextResponse.json({ message: 'Insufficient wallet balance' }, { status: 400 });
            }
            user.walletBalance -= walletUsed;
            await user.save();

            await WalletTransaction.create({
                userId,
                type: 'debit',
                amount: walletUsed,
                description: `Payment for Order #${orderNumber}`
            });
        }

        const order = await Order.create({
            userId,
            orderNumber,
            items: orderItems,
            shippingAddress,
            guestInfo: isGuest ? guestInfo : null,
            isGuest,
            paymentMethod,
            subtotal,
            shippingFee,
            tax,
            walletAmount: walletUsed,
            total,
            notes,
        });

        const email = isGuest ? guestInfo?.email : userEmail;
        if (email) await sendOrderConfirmation(email, order);

        return NextResponse.json({ message: 'Order created successfully', order }, { status: 201 });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
