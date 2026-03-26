import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Message from '@/lib/models/Message';
import { verifyAccessToken } from '@/lib/services/tokenService';

async function getAdminUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    if (!decoded) return null;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') return null;
    return user;
}

// GET /api/admin/stats
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const admin = await getAdminUser(req);
        if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });
        const totalProducts = await Product.countDocuments({ status: 'active' });
        const totalUsers = await User.countDocuments({ isActive: true });

        // Get unread messages count
        const unreadMessagesCount = await Message.countDocuments({ isRead: false });

        // Get low stock items (stock < 10)
        const lowStockItems = await Product.find({ stock: { $lt: 10 }, status: 'active' })
            .select('title stock images')
            .limit(5);

        // Get recent orders with user details
        const recentOrders = await Order.find()
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate total revenue
        const revenue = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);

        // Get monthly revenue for chart
        const monthlyRevenue = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 },
        ]);

        // Generate Recent Activity Log (Combine orders and messages)
        const [lastOrders, lastMessages] = await Promise.all([
            Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'fullName'),
            Message.find().sort({ createdAt: -1 }).limit(5)
        ]);

        const recentActivity = [
            ...lastOrders.map(o => ({
                type: 'order',
                title: `New Order #${o.orderNumber}`,
                user: o.isGuest ? (o.guestInfo?.fullName || 'Guest') : (o.userId as any)?.fullName || 'Member',
                time: o.createdAt
            })),
            ...lastMessages.map(m => ({
                type: 'message',
                title: `New Message: ${m.subject}`,
                user: m.name,
                time: m.createdAt
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        // Calculate total wallet balance and points across all users
        const userStats = await User.aggregate([
            { $group: { _id: null, totalBalance: { $sum: '$walletBalance' }, totalPoints: { $sum: '$points' } } }
        ]);

        return NextResponse.json({
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalProducts,
            totalUsers,
            unreadMessagesCount,
            lowStockItems,
            recentOrders,
            recentActivity,
            salesHistory: monthlyRevenue, // Frontend expects salesHistory
            totalRevenue: revenue[0]?.total || 0,
            totalWalletBalance: userStats[0]?.totalBalance || 0,
            totalPoints: userStats[0]?.totalPoints || 0,
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Stats API Error:', err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
