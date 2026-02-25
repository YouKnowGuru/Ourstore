'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Aesthetic Layers */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-saffron/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-maroon/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto">
                <div className="relative inline-block">
                    <h1 className="text-9xl font-black text-stone-900 opacity-5">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl md:text-6xl font-display font-black text-maroon tracking-tighter">
                            Page Not Found
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-stone-800">
                        Lost in the Himalayas?
                    </h2>
                    <p className="text-stone-600 text-lg max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved to another peak.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-2xl px-8 py-6 h-auto text-lg font-bold border-2 hover:bg-stone-50"
                        asChild
                    >
                        <Link href="/">
                            <Home className="w-5 h-5 mr-2" />
                            Back Home
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        className="bg-maroon hover:bg-maroon/90 text-white rounded-2xl px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-maroon/20"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Previous Page
                    </Button>
                </div>

                {/* Decorative Pattern */}
                <div className="pt-12 opacity-10">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-maroon to-transparent" />
                    <div className="grid grid-cols-8 gap-2 pt-4 justify-items-center">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-maroon" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
