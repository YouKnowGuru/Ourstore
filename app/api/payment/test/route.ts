/**
 * POST /api/payment/test
 *
 * ⚠️  DEVELOPMENT/TESTING ONLY — DO NOT USE IN PRODUCTION ⚠️
 *
 * Simulates the BFS Secure payment flow without hitting the real gateway.
 * Useful for testing order creation, transaction logging, and callback handling.
 *
 * Request body:
 *   {
 *     "orderId": "<mongoId>",
 *     "remitterEmail": "test@example.com",   // optional
 *     "simulatedResult": "SUCCESS" | "FAILED" | "PENDING"  // default: SUCCESS
 *   }
 *
 * What it does:
 *   1. Looks up the order (same as /api/payment/create)
 *   2. Creates a BfsTransaction record with status INITIATED
 *   3. Immediately simulates a BFS callback with the desired outcome
 *   4. Updates the BfsTransaction and Order accordingly
 *   5. Returns JSON with the final status and redirect URL
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Block in production
if (process.env.NODE_ENV === 'production') {
  // We still export the handler but it returns 404 in production (see handler)
}

import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import BfsTransaction from '@/lib/models/BfsTransaction';

type SimulatedResult = 'SUCCESS' | 'FAILED' | 'PENDING';

/** Generate a unique BFS-compatible order number for test runs */
function generateTestOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TST${ts}${rand}`.slice(0, 20);
}

/** Build a fake BFS transaction ID for test runs */
function generateTestTxnId(): string {
  return `BFSTEST-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

export async function POST(req: NextRequest) {
  // ── Block in production ───────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { message: 'This endpoint is disabled in production.' },
      { status: 404 }
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const {
      orderId,
      remitterEmail,
      simulatedResult = 'SUCCESS',
    } = body as {
      orderId: string;
      remitterEmail?: string;
      simulatedResult?: SimulatedResult;
    };

    // ── Validate input ────────────────────────────────────────────
    if (!orderId) {
      return NextResponse.json(
        { message: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!['SUCCESS', 'FAILED', 'PENDING'].includes(simulatedResult)) {
      return NextResponse.json(
        { message: 'simulatedResult must be SUCCESS, FAILED, or PENDING' },
        { status: 400 }
      );
    }

    // ── 1. Look up the Order ──────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.paymentMethod !== 'Online') {
      return NextResponse.json(
        { message: 'Order is not configured for Online payment' },
        { status: 400 }
      );
    }

    // ── 2. Mark any old pending transactions as TIMEOUT ───────────
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
      existingTxn.status = 'TIMEOUT';
      existingTxn.statusMessage = 'Superseded by test payment attempt';
      await existingTxn.save();
    }

    // ── 3. Generate test order number ─────────────────────────────
    let orderNo = generateTestOrderNo();
    let attempts = 0;
    while (await BfsTransaction.findOne({ orderNo })) {
      orderNo = generateTestOrderNo();
      if (++attempts > 10) {
        return NextResponse.json(
          { message: 'Failed to generate unique test order number' },
          { status: 500 }
        );
      }
    }

    const email = remitterEmail || order.guestInfo?.email || 'test@example.com';

    // ── 4. Create BfsTransaction (INITIATED) ──────────────────────
    const bfsTxn = await BfsTransaction.create({
      orderId: order._id,
      orderNo,
      amount: order.total,
      currency: 'BTN',
      remitterEmail: email,
      status: 'INITIATED',
      statusMessage: `[TEST] Payment initiated — simulating ${simulatedResult}`,
      arPayload: {
        test: true,
        simulatedResult,
        orderId,
        amount: order.total,
      },
    });

    order.bfsTransactionId = bfsTxn._id;
    await order.save();

    // ── 5. Simulate BFS callback (AC response) ────────────────────
    const txnId = generateTestTxnId();

    const debitAuthCodeMap: Record<SimulatedResult, string> = {
      SUCCESS: '0000',
      FAILED: '1001',
      PENDING: '0001',
    };

    const statusMessageMap: Record<SimulatedResult, string> = {
      SUCCESS: '[TEST] Transaction approved',
      FAILED: '[TEST] Transaction declined by bank (simulated)',
      PENDING: '[TEST] Transaction pending confirmation',
    };

    bfsTxn.bfsTxnId = txnId;
    bfsTxn.remitterName = 'Test Customer';
    bfsTxn.remitterBankId = 'TESTBANK01';
    bfsTxn.debitAuthCode = debitAuthCodeMap[simulatedResult];
    bfsTxn.debitAuthNo = `DEBITAUTH-${Date.now()}`;
    bfsTxn.status = simulatedResult;
    bfsTxn.statusMessage = statusMessageMap[simulatedResult];
    bfsTxn.acPayload = { test: true, simulatedAt: new Date().toISOString() };
    await bfsTxn.save();

    // ── 6. Update linked Order ────────────────────────────────────
    if (simulatedResult === 'SUCCESS') {
      order.paymentStatus = 'Completed';
      order.orderStatus = 'Processing';
    } else if (simulatedResult === 'FAILED') {
      order.paymentStatus = 'Failed';
    }
    await order.save();

    console.log(
      `[BFS-TEST] Simulated ${simulatedResult}: orderNo=${orderNo}, orderId=${orderId}, txnId=${txnId}`
    );

    // ── 7. Return result with redirect URL ────────────────────────
    const baseUrl = new URL(req.url).origin;
    const redirectUrlMap: Record<SimulatedResult, string> = {
      SUCCESS: `${baseUrl}/payment/success?orderNo=${orderNo}`,
      FAILED:  `${baseUrl}/payment/failure?orderNo=${orderNo}&reason=${encodeURIComponent('[TEST] Simulated failure')}`,
      PENDING: `${baseUrl}/payment/pending?orderNo=${orderNo}`,
    };

    return NextResponse.json({
      test: true,
      simulatedResult,
      orderNo,
      txnId,
      orderId,
      amount: order.total,
      currency: 'BTN',
      status: bfsTxn.status,
      statusMessage: bfsTxn.statusMessage,
      redirectUrl: redirectUrlMap[simulatedResult],
      message: `[TEST] Payment simulation complete. Open redirectUrl to see the UI result.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[BFS-TEST] Error:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
