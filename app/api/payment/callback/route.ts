/**
 * POST /api/payment/callback
 *
 * Receives Authorization Confirmation (AC) from BFS Secure.
 * Validates checksum, updates transaction & order, then redirects user.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import connectDB from '@/lib/mongodb';
import BfsTransaction from '@/lib/models/BfsTransaction';
import Order from '@/lib/models/Order';
import { parseACResponse } from '@/lib/bfs/bfsSecure';

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint is for BFS Secure payment callbacks (POST only).' },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ── 1. Parse form-encoded or JSON body ────────────────────────
    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, string>;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      body = {} as Record<string, string>;
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } else {
      body = await req.json();
    }

    console.log('[BFS] AC callback received:', JSON.stringify(body));

    // ── Helper to resolve the correct Base URL ────────────────────
    function getBaseUrl(): string {
      let envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
      if (envUrl && !envUrl.includes('0.0.0.0')) {
        return envUrl;
      }
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
      const proto = req.headers.get('x-forwarded-proto') || 'https';
      if (host) {
        return `${proto}://${host}`;
      }
      return new URL(req.url).origin;
    }
    const baseUrl = getBaseUrl();

    // ── 2. Parse and validate AC response ─────────────────────────
    const acData = parseACResponse(body);

    if (!acData.orderNo) {
      console.error('[BFS] AC callback missing orderNo');
      return NextResponse.redirect(`${baseUrl}/payment/failure?reason=missing_order`);
    }

    // ── 3. Find BFS Transaction ───────────────────────────────────
    const bfsTxn = await BfsTransaction.findOne({ orderNo: acData.orderNo });

    if (!bfsTxn) {
      console.error(`[BFS] No transaction found for orderNo: ${acData.orderNo}`);
      return NextResponse.redirect(`${baseUrl}/payment/failure?reason=txn_not_found`);
    }

    // ── 4. Verify checksum ────────────────────────────────────────
    if (!acData.isValid) {
      console.error(`[BFS] Invalid checksum for orderNo: ${acData.orderNo}`);
      bfsTxn.status = 'FAILED';
      bfsTxn.statusMessage = 'Checksum verification failed — possible tampering';
      bfsTxn.acPayload = body;
      await bfsTxn.save();

      return NextResponse.redirect(`${baseUrl}/payment/failure?reason=checksum_invalid`);
    }

    // ── 5. Validate amount matches ────────────────────────────────
    const receivedAmount = parseFloat(acData.txnAmount);
    if (Math.abs(receivedAmount - bfsTxn.amount) > 0.01) {
      console.error(
        `[BFS] Amount mismatch: expected=${bfsTxn.amount}, received=${receivedAmount}`
      );
      bfsTxn.status = 'FAILED';
      bfsTxn.statusMessage = `Amount mismatch: expected ${bfsTxn.amount}, got ${receivedAmount}`;
      bfsTxn.acPayload = body;
      await bfsTxn.save();

      return NextResponse.redirect(`${baseUrl}/payment/failure?reason=amount_mismatch`);
    }

    // ── 6. Update BFS Transaction ─────────────────────────────────
    bfsTxn.bfsTxnId = acData.txnId;
    bfsTxn.remitterName = acData.remitterName;
    bfsTxn.remitterBankId = acData.remitterBankId;
    bfsTxn.debitAuthCode = acData.debitAuthCode;
    bfsTxn.debitAuthNo = acData.debitAuthNo;
    bfsTxn.status = acData.status;
    bfsTxn.statusMessage = acData.statusMessage;
    bfsTxn.acPayload = body;
    await bfsTxn.save();

    // ── 7. Update linked Order ────────────────────────────────────
    const order = await Order.findById(bfsTxn.orderId);
    if (order) {
      if (acData.status === 'SUCCESS') {
        order.paymentStatus = 'Completed';
        order.orderStatus = 'Processing';
      } else if (acData.status === 'FAILED') {
        order.paymentStatus = 'Failed';
      }
      // PENDING status → leave order as-is, poll via /api/payment/status
      await order.save();
    }

    console.log(
      `[BFS] AC processed: orderNo=${acData.orderNo}, status=${acData.status}, txnId=${acData.txnId}`
    );

    // ── 8. Redirect user to appropriate page ──────────────────────
    switch (acData.status) {
      case 'SUCCESS':
        return NextResponse.redirect(
          `${baseUrl}/payment/success?orderNo=${acData.orderNo}`
        );
      case 'PENDING':
        return NextResponse.redirect(
          `${baseUrl}/payment/pending?orderNo=${acData.orderNo}`
        );
      default:
        return NextResponse.redirect(
          `${baseUrl}/payment/failure?orderNo=${acData.orderNo}&reason=${encodeURIComponent(acData.statusMessage)}`
        );
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[BFS] Callback processing error:', err);
    // Best effort redirect if baseUrl isn't defined yet
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'ourstore.tech';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    return NextResponse.redirect(
      `${proto}://${host}/payment/failure?reason=server_error`
    );
  }
}
