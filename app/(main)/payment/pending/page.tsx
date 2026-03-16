'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { Clock, RefreshCw, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';
import Link from 'next/link';

const POLL_INTERVAL = 10000; // 10 seconds
const MAX_POLLS = 30;        // 5 minutes total

function PendingContent() {
    const { emptyCart } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderNo = searchParams.get('orderNo') || '';

    useEffect(() => {
        emptyCart();
    }, [emptyCart]);

    const [pollCount, setPollCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Waiting for payment confirmation from BFS Secure…');
    const [isPolling, setIsPolling] = useState(true);

    const checkStatus = useCallback(async () => {
        if (!orderNo || !isPolling) return;

        try {
            const res = await fetch('/api/payment/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNo }),
            });

            const data = await res.json();

            if (data.status === 'SUCCESS') {
                setIsPolling(false);
                setStatusMessage('Payment confirmed! Redirecting…');
                setTimeout(() => {
                    router.push(`/payment/success?orderNo=${orderNo}`);
                }, 1500);
                return;
            }

            if (data.status === 'FAILED' || data.status === 'TIMEOUT') {
                setIsPolling(false);
                setStatusMessage('Payment could not be confirmed.');
                setTimeout(() => {
                    router.push(`/payment/failure?orderNo=${orderNo}&reason=${encodeURIComponent(data.statusMessage || 'timeout')}`);
                }, 1500);
                return;
            }

            setStatusMessage(data.statusMessage || 'Still waiting for confirmation…');
            setPollCount((c) => c + 1);
        } catch (err) {
            console.error('[BFS] Status poll error:', err);
            setStatusMessage('Connection issue. Still checking…');
            setPollCount((c) => c + 1);
        }
    }, [orderNo, isPolling, router]);

    useEffect(() => {
        if (!isPolling || pollCount >= MAX_POLLS) {
            if (pollCount >= MAX_POLLS) {
                setIsPolling(false);
                setStatusMessage('Status check timed out. Please check your order status later.');
            }
            return;
        }

        const timer = setTimeout(checkStatus, POLL_INTERVAL);
        return () => clearTimeout(timer);
    }, [pollCount, isPolling, checkStatus]);

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-amber-50/50 via-bhutan-cream to-bhutan-cream">
            <div className="bhutan-container flex items-center justify-center">
                <div className="max-w-lg w-full text-center space-y-8">
                    {/* Pending Animation */}
                    <div className="relative mx-auto w-28 h-28">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-300 animate-[spin_8s_linear_infinite]" />
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                            {isPolling ? (
                                <Loader2 className="w-14 h-14 text-white animate-spin" strokeWidth={2.5} />
                            ) : (
                                <Clock className="w-14 h-14 text-white" strokeWidth={2.5} />
                            )}
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-10 space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-3">
                                Payment Pending
                            </h1>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {statusMessage}
                            </p>
                        </div>

                        {orderNo && (
                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-700/60">
                                        BFS Order No.
                                    </span>
                                    <span className="text-sm font-mono font-bold text-amber-900">
                                        {orderNo}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-700/60">
                                        Status
                                    </span>
                                    <span className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                                        {isPolling && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                        {isPolling ? 'Awaiting Confirmation' : 'Check Timed Out'}
                                    </span>
                                </div>
                                {isPolling && (
                                    <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((pollCount / MAX_POLLS) * 100, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            <p className="text-sm text-blue-800 font-medium">
                                Do not close this page or navigate away.
                                We are automatically checking the status of your payment every 10 seconds.
                            </p>
                        </div>

                        {/* Manual retry + home */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {isPolling ? (
                                <Button
                                    disabled
                                    className="flex-1 h-14 bg-gray-100 text-gray-400 rounded-2xl font-black gap-2 cursor-not-allowed"
                                >
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Checking…
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        setPollCount(0);
                                        setIsPolling(true);
                                        setStatusMessage('Re-checking payment status…');
                                    }}
                                    className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] text-white rounded-2xl font-black shadow-xl transition-all duration-500 gap-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Check Again
                                </Button>
                            )}
                            <Link href="/" className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl border-gray-200 font-bold hover:bg-gray-50 gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        Secured by BFS Secure • Royal Monetary Authority of Bhutan
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <PendingContent />
        </Suspense>
    );
}
