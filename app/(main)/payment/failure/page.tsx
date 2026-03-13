'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { XCircle, RefreshCw, MessageSquare, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REASON_MESSAGES: Record<string, string> = {
    checksum_invalid: 'The payment response could not be verified. This may indicate tampering. No funds were deducted.',
    amount_mismatch: 'The payment amount did not match the order total. Please try again.',
    missing_order: 'The payment response was missing order information.',
    txn_not_found: 'We could not find the payment transaction. Please contact support.',
    server_error: 'An unexpected error occurred while processing the payment.',
};

function FailureContent() {
    const searchParams = useSearchParams();
    const orderNo = searchParams.get('orderNo') || '';
    const reason = searchParams.get('reason') || '';

    const errorMessage =
        REASON_MESSAGES[reason] ||
        (reason ? decodeURIComponent(reason) : 'Your payment could not be completed. Please try again or use an alternative payment method.');

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-red-50/50 via-bhutan-cream to-bhutan-cream">
            <div className="bhutan-container flex items-center justify-center">
                <div className="max-w-lg w-full text-center space-y-8">
                    {/* Failure Icon */}
                    <div className="relative mx-auto w-28 h-28">
                        <div className="absolute inset-0 rounded-full bg-red-400/10 animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/20">
                            <XCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-10 space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent mb-3">
                                Payment Failed
                            </h1>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {errorMessage}
                            </p>
                        </div>

                        {orderNo && (
                            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-red-700/60">
                                        BFS Order No.
                                    </span>
                                    <span className="text-sm font-mono font-bold text-red-900">
                                        {orderNo}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-red-700/60">
                                        Status
                                    </span>
                                    <span className="text-sm font-bold text-red-700">
                                        Not Completed
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                            <p className="text-sm text-amber-800 font-medium">
                                If your account was charged, the amount will be reversed within 3–5 business days.
                                Contact your bank for more details.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link href="/checkout" className="flex-1">
                                <Button className="w-full h-14 bg-gradient-to-r from-maroon to-maroon-800 hover:scale-[1.02] text-white rounded-2xl font-black shadow-xl transition-all duration-500 gap-2">
                                    <RefreshCw className="w-5 h-5" />
                                    Try Again
                                </Button>
                            </Link>
                            <Link href="/contact" className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl border-gray-200 font-bold hover:bg-gray-50 gap-2"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Contact Support
                                </Button>
                            </Link>
                        </div>

                        <Link href="/">
                            <Button variant="ghost" className="w-full h-12 font-bold text-gray-400 hover:text-gray-600 gap-2 mt-2">
                                <Home className="w-4 h-4" />
                                Return to Home
                            </Button>
                        </Link>
                    </div>

                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        Secured by BFS Secure • Royal Monetary Authority of Bhutan
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <FailureContent />
        </Suspense>
    );
}
