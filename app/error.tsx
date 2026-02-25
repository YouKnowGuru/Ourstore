'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Aesthetic Layers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-maroon/5 blur-[150px] rounded-full" />

            <div className="relative z-10 text-center space-y-8 max-w-xl mx-auto p-12 bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-stone-100">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-maroon/10 flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-12 h-12 text-maroon" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-display font-black text-stone-900 tracking-tight">
                        Something went wrong!
                    </h1>
                    <p className="text-stone-600 text-lg leading-relaxed">
                        An unexpected error occurred. Don't worry, our team has been notified.
                        {error.digest && (
                            <span className="block mt-2 text-xs font-mono text-stone-400">
                                ID: {error.digest}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        className="bg-maroon hover:bg-maroon/90 text-white rounded-2xl px-10 py-6 h-auto text-lg font-bold shadow-lg shadow-maroon/30 w-full sm:w-auto overflow-hidden group relative"
                        onClick={() => reset()}
                    >
                        <RefreshCcw className="w-5 h-5 mr-2 group-active:rotate-180 transition-transform duration-500" />
                        Try Again
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-2xl px-10 py-6 h-auto text-lg font-bold border-2 hover:bg-stone-50 w-full sm:w-auto"
                        asChild
                    >
                        <Link href="/">
                            <Home className="w-5 h-5 mr-2" />
                            Return Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
