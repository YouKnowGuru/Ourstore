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
    console.log('[BFS-AC-DEBUG] Raw field names:', Object.keys(body));
    console.log('[BFS-AC-DEBUG] Field count:', Object.keys(body).length);
    
    // Log each field (mask sensitive data)
    Object.entries(body).forEach(([key, value]) => {
      if (key.toLowerCase().includes('checksum')) {
        console.log(`[BFS-AC-DEBUG] ${key}: ${value.substring(0, 40)}... (length: ${value.length})`);
      } else {
        console.log(`[BFS-AC-DEBUG] ${key}: ${value}`);
      }
    });

    // ── Helper to resolve the correct Base URL ────────────────────
    // BFS callback is a server-to-server POST — no browser headers.
    // req.url / host will be internal (0.0.0.0:3000). We must resolve
    // the actual public domain.
    function getBaseUrl(): string {
      // 1. Check explicitly configured env var
      const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
      if (envUrl && !envUrl.includes('0.0.0.0') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/$/, '');
      }
      // 2. Try forwarded headers (works when behind Nginx with proper proxy config)
      const fwdHost = req.headers.get('x-forwarded-host');
      const fwdProto = req.headers.get('x-forwarded-proto') || 'https';
      if (fwdHost && !fwdHost.includes('0.0.0.0')) {
        return `${fwdProto}://${fwdHost}`;
      }
      // 3. Try regular host header
      const host = req.headers.get('host');
      if (host && !host.includes('0.0.0.0') && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        return `https://${host}`;
      }
      // 4. Hardcoded production fallback
      return 'https://ourstore.tech';
    }
    const baseUrl = getBaseUrl();
    console.log('[BFS] Resolved redirect baseUrl:', baseUrl);

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
        const wasCompleted = order.paymentStatus === 'Completed';
        
        order.paymentStatus = 'Completed';
        order.orderStatus = 'Processing';

        if (!wasCompleted && order.userId) {
            // Award points for successful online purchase
            fetch(`${baseUrl}/api/points/earn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: order.userId.toString(), 
                    action: 'purchase', 
                    orderTotal: bfsTxn.amount 
                }),
            }).catch(e => console.error('[BFS] Failed to award points:', e));
        }
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
    return NextResponse.redirect(
      'https://ourstore.tech/payment/failure?reason=server_error'
    );
  }
}
