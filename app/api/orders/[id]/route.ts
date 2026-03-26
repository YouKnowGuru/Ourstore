import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';
import { sendOrderStatusUpdate } from '@/lib/services/emailService';

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    return await User.findById(decoded.userId);
}

// GET /api/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = { _id: id };
        if (user.role !== 'admin') query.userId = user._id;

        const order = await Order.findOne(query).populate('items.productId', 'title images');
        if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

        return NextResponse.json(order);
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PATCH /api/orders/[id] - update order status (admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const user = await getUser(req);
        if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { orderStatus, trackingNumber, paymentStatus } = await req.json();

        const order = await Order.findById(id).populate('userId', 'email');
        if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

        if (orderStatus) order.orderStatus = orderStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        await order.save();

        if (orderStatus) {
            const email = order.isGuest ? order.guestInfo?.email : (order.userId as unknown as { email: string })?.email;
            if (email) await sendOrderStatusUpdate(email, order);
        }

        return NextResponse.json({ message: 'Order updated', order });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// DELETE /api/orders/[id] - cancel order
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const user = await getUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = { _id: id };
        if (user.role !== 'admin') query.userId = user._id;

        const order = await Order.findOne(query);
        if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

        if (user.role === 'admin') {
            // Restore stock if it's not already cancelled, delivered or shipped
            if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Shipped') {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, salesCount: -item.quantity } });
                }
            }
            await Order.findByIdAndDelete(id);
            return NextResponse.json({ message: 'Order deleted permanently' });
        }

        if (order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped') {
            return NextResponse.json({ message: 'Cannot cancel delivered or shipped orders' }, { status: 400 });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, salesCount: -item.quantity } });
        }

        return NextResponse.json({ message: 'Order cancelled successfully' });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
