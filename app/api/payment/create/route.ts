/**
 * POST /api/payment/create
 *
 * Initiates BFS Secure payment for an existing Order.
 * Returns an auto-submit HTML form that redirects to BFS payment page.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import BfsTransaction from '@/lib/models/BfsTransaction';
import { createARMessage, generateAutoSubmitForm } from '@/lib/bfs/bfsSecure';

/**
 * Generate a unique BFS-compatible order number.
 * Format: BFS + timestamp + random suffix (max 20 chars)
 */
function generateBfsOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BFS${ts}${rand}`.slice(0, 20);
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint is for initiating BFS Secure payments (POST only).' },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { orderId, remitterEmail } = body;

    if (!orderId) {
      return NextResponse.json(
        { message: 'orderId is required' },
        { status: 400 }
      );
    }

    // ── 1. Look up the Order ──────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.paymentMethod !== 'Online') {
      return NextResponse.json(
        { message: 'Order is not set for online payment' },
        { status: 400 }
      );
    }

    // ── 2. Prevent duplicate BFS transactions ─────────────────────
    const existingTxn = await BfsTransaction.findOne({
      orderId: order._id,
      status: { $in: ['INITIATED', 'PENDING', 'SUCCESS'] },
    });

    if (existingTxn) {
      if (existingTxn.status === 'SUCCESS') {
        return NextResponse.json(
          { message: 'Payment already completed for this order' },
          { status: 400 }
        );
      }

      // If there's an initiated/pending txn, let user retry
      // But mark old one as TIMEOUT first
      if (existingTxn.status === 'INITIATED' || existingTxn.status === 'PENDING') {
        existingTxn.status = 'TIMEOUT';
        existingTxn.statusMessage = 'Superseded by new payment attempt';
        await existingTxn.save();
      }
    }

    // ── 3. Generate unique BFS order number ───────────────────────
    let orderNo = generateBfsOrderNo();
    let attempts = 0;
    while (await BfsTransaction.findOne({ orderNo })) {
      orderNo = generateBfsOrderNo();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { message: 'Failed to generate unique order number' },
          { status: 500 }
        );
      }
    }

    // ── 4. Build AR message ───────────────────────────────────────
    const email = remitterEmail || order.guestInfo?.email || '';
    const paymentDesc = `Order #${order.orderNumber}`;

    const { fields, paymentUrl, sourceString } = createARMessage({
      orderNo,
      amount: order.total,
      remitterEmail: email,
      paymentDesc,
    });

    // ── 5. Save BFS Transaction ───────────────────────────────────
    const bfsTxn = await BfsTransaction.create({
      orderId: order._id,
      orderNo,
      amount: order.total,
      currency: 'BTN',
      remitterEmail: email,
      status: 'INITIATED',
      statusMessage: 'Payment initiated, redirecting to BFS Secure',
      arPayload: { fields, sourceString },
    });

    // Link transaction to order
    order.bfsTransactionId = bfsTxn._id;
    await order.save();

    console.log(
      `[BFS] AR created: orderNo=${orderNo}, orderId=${orderId}, amount=${order.total}`
    );

    // ── 6. Generate auto-submit HTML form ─────────────────────────
    const html = generateAutoSubmitForm(fields, paymentUrl);

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[BFS] Payment creation error:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
