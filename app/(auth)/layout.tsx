'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-saffron/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-6xl flex bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 min-h-[700px] relative z-10">
                {/* Left Side: Illustration / Welcome (Visible on Tablet/Desktop) */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1a1c2e] via-[#2d0b14] to-black relative items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 mandala-pattern opacity-10" />
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-maroon/20 to-transparent" />

                    <div className="relative z-10 text-center space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center p-6 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl mx-auto mb-6 transform hover:rotate-3 transition-transform duration-500">
                            <Image
                                src="/images/logo.png"
                                alt="Our Store"
                                width={128}
                                height={128}
                                className="object-contain animate-float-subtle"
                            />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-display font-black text-white tracking-tight leading-tight">
                                Elevating Technology <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-saffron to-gold">with Heart</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-sm mx-auto font-medium leading-relaxed">
                                Connect with the soul of Bhutanese tech through our curated premium collection.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2">
                                <span className="text-2xl font-black text-white">100%</span>
                                <span className="text-sm uppercase font-bold tracking-widest text-gray-400">Authentic Tech</span>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2">
                                <span className="text-2xl font-black text-white">24/7</span>
                                <span className="text-sm uppercase font-bold tracking-widest text-gray-400">Expert Support</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-y-auto">
                    {/* Subtle Mobile Header */}
                    <div className="absolute top-8 left-8 right-8 flex lg:hidden items-center justify-between pointer-events-none">
                        <Link href="/" className="p-2.5 bg-gray-50 rounded-xl pointer-events-auto">
                            <Image
                                src="/images/logo.png"
                                alt="Our Store"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </Link>
                    </div>

                    <div className="w-full max-w-xl space-y-8">
                        {/* Mobile Welcome Illustration (Visible on Mobile) */}
                        <div className="md:hidden flex flex-col items-center mb-10 gap-4">
                            <Image
                                src="/images/logo.png"
                                alt="Our Store"
                                width={96}
                                height={96}
                                className="object-contain animate-float-subtle"
                            />
                        </div>

                        {/* Desktop Minimal Header */}
                        <div className="hidden md:block mb-8">
                            <Link href="/" className="inline-flex items-center gap-3 group">
                                <div className="flex items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-saffron/10 group-hover:border-saffron/30 transition-all duration-300">
                                    <Image
                                        src="/images/logo.png"
                                        alt="Our Store"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Return to Shop</span>
                            </Link>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
