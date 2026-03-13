'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNo = searchParams.get('orderNo') || '';

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-green-50/50 via-bhutan-cream to-bhutan-cream">
            <div className="bhutan-container flex items-center justify-center">
                <div className="max-w-lg w-full text-center space-y-8">
                    {/* Success Animation */}
                    <div className="relative mx-auto w-28 h-28">
                        {/* Glow rings */}
                        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full bg-green-400/15 animate-pulse" />
                        {/* Icon */}
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-10 space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-3">
                                Payment Successful!
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Your transaction has been processed securely via BFS Secure.
                            </p>
                        </div>

                        {/* Transaction Details */}
                        {orderNo && (
                            <div className="bg-green-50 rounded-2xl p-5 border border-green-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-green-700/60">
                                        BFS Order No.
                                    </span>
                                    <span className="text-sm font-mono font-bold text-green-900">
                                        {orderNo}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-green-700/60">
                                        Status
                                    </span>
                                    <span className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Confirmed
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                            <p className="text-sm text-amber-800 font-medium">
                                A confirmation email has been sent to your registered address.
                                Your order is now being processed.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link href="/" className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl border-gray-200 font-bold hover:bg-gray-50 gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    Back to Home
                                </Button>
                            </Link>
                            <Link href="/products" className="flex-1">
                                <Button className="w-full h-14 bg-gradient-to-r from-saffron to-saffron-600 hover:scale-[1.02] text-white rounded-2xl font-black shadow-xl transition-all duration-500 gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Continue Shopping
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Security footer */}
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        Secured by BFS Secure • Royal Monetary Authority of Bhutan
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
