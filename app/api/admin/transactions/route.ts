import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BfsTransaction from '@/lib/models/BfsTransaction';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/services/tokenService';

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

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const admin = await getAdminUser(req);
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const orderNo = searchParams.get('orderNo');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status) query.status = status;
    if (orderNo) query.orderNo = { $regex: orderNo, $options: 'i' };
    
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      BfsTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'orderNumber total'),
      BfsTransaction.countDocuments(query)
    ]);
    
    return NextResponse.json({
      transactions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error: any) {
    console.error('[Admin API] Get transactions error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
