/**
 * POST /api/payment/status
 *
 * Sends an Authorization Status (AS) query to BFS Secure
 * for a given orderNo, updates the transaction, and returns the result.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import connectDB from '@/lib/mongodb';
import BfsTransaction from '@/lib/models/BfsTransaction';
import Order from '@/lib/models/Order';
import { queryTransactionStatus } from '@/lib/bfs/bfsSecure';

const MAX_RETRIES = 5;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { orderNo } = body;

    if (!orderNo) {
      return NextResponse.json(
        { message: 'orderNo is required' },
        { status: 400 }
      );
    }

    // ── 1. Find BFS Transaction ───────────────────────────────────
    const bfsTxn = await BfsTransaction.findOne({ orderNo });

    if (!bfsTxn) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // If already resolved, just return current status
    if (bfsTxn.status === 'SUCCESS' || bfsTxn.status === 'FAILED') {
      return NextResponse.json({
        message: 'Transaction already resolved',
        orderNo: bfsTxn.orderNo,
        status: bfsTxn.status,
        statusMessage: bfsTxn.statusMessage,
        bfsTxnId: bfsTxn.bfsTxnId,
      });
    }

    // Check retry limit
    if (bfsTxn.retryCount >= MAX_RETRIES) {
      bfsTxn.status = 'TIMEOUT';
      bfsTxn.statusMessage = `Max status query retries (${MAX_RETRIES}) exceeded`;
      await bfsTxn.save();

      return NextResponse.json({
        message: 'Max retries exceeded',
        orderNo: bfsTxn.orderNo,
        status: bfsTxn.status,
        statusMessage: bfsTxn.statusMessage,
      });
    }

    // ── 2. Query BFS Secure ───────────────────────────────────────
    console.log(
      `[BFS] Sending AS query: orderNo=${orderNo}, retry=${bfsTxn.retryCount + 1}`
    );

    let statusResult;
    try {
      statusResult = await queryTransactionStatus({ orderNo });
    } catch (queryError) {
      const qErr = queryError as Error;
      console.error(`[BFS] AS query failed: ${qErr.message}`);

      bfsTxn.retryCount += 1;
      await bfsTxn.save();

      return NextResponse.json(
        {
          message: 'Status query failed',
          error: qErr.message,
          retryCount: bfsTxn.retryCount,
        },
        { status: 502 }
      );
    }

    // ── 3. Update BFS Transaction ─────────────────────────────────
    bfsTxn.retryCount += 1;
    bfsTxn.bfsTxnId = statusResult.txnId || bfsTxn.bfsTxnId;
    bfsTxn.remitterName = statusResult.remitterName || bfsTxn.remitterName;
    bfsTxn.remitterBankId = statusResult.remitterBankId || bfsTxn.remitterBankId;
    bfsTxn.debitAuthCode = statusResult.debitAuthCode || bfsTxn.debitAuthCode;
    bfsTxn.debitAuthNo = statusResult.debitAuthNo || bfsTxn.debitAuthNo;
    bfsTxn.status = statusResult.status;
    bfsTxn.statusMessage = statusResult.statusMessage;
    await bfsTxn.save();

    // ── 4. Update linked Order ────────────────────────────────────
    const order = await Order.findById(bfsTxn.orderId);
    if (order) {
      if (statusResult.status === 'SUCCESS') {
        order.paymentStatus = 'Completed';
        order.orderStatus = 'Processing';
      } else if (statusResult.status === 'FAILED') {
        order.paymentStatus = 'Failed';
      }
      await order.save();
    }

    console.log(
      `[BFS] AS response: orderNo=${orderNo}, status=${statusResult.status}, txnId=${statusResult.txnId}`
    );

    // ── 5. Return result ──────────────────────────────────────────
    return NextResponse.json({
      orderNo: bfsTxn.orderNo,
      status: bfsTxn.status,
      statusMessage: bfsTxn.statusMessage,
      bfsTxnId: bfsTxn.bfsTxnId,
      retryCount: bfsTxn.retryCount,
      isValid: statusResult.isValid,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[BFS] Status check error:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
