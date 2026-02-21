'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Wrench,
    Info,
    ShoppingBag,
    Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MobileNav - A premium, floating bottom navigation bar for mobile devices.
 * Features glassmorphism, micro-animations, and haptic-like feedback.
 */
const MobileNav = () => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Categories', icon: LayoutGrid, href: '/#categories' },
        { label: 'Services', icon: Wrench, href: '/#features' },
        { label: 'About', icon: Info, href: '/about' },
        { label: 'Products', icon: ShoppingBag, href: '/products' },
        { label: 'Contact', icon: Phone, href: '/contact' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] animate-fade-in shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100/50 px-2 pt-2 pb-safe-bottom">
                <nav className="flex items-center justify-between max-w-md mx-auto relative h-16 px-2">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href || (item.href.startsWith('/#') && pathname === '/');

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 transition-all duration-500 flex-1 h-full pt-1",
                                    isActive ? "text-maroon" : "text-gray-400"
                                )}
                            >
                                {/* Active Backdrop Glow & Blob */}
                                {isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                                        <div className="w-12 h-12 bg-maroon/5 rounded-full blur-xl animate-pulse-slow" />
                                        <div className="absolute top-0 w-12 h-1 bg-maroon rounded-full animate-scale-in" />
                                    </div>
                                )}

                                {/* Icon Container with Elastic Animation */}
                                <div className={cn(
                                    "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-700 ease-spring",
                                    isActive
                                        ? "bg-gradient-to-br from-maroon to-maroon-700 text-white shadow-glow-maroon scale-110 -translate-y-2 rotate-[3deg]"
                                        : "hover:bg-gray-100 hover:text-gray-600 hover:scale-110"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-transform duration-700",
                                        isActive ? "animate-float-subtle" : "group-hover:rotate-12"
                                    )} />

                                    {/* Active Sparkle Effect */}
                                    {isActive && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-saffron rounded-full animate-ping" />
                                    )}
                                </div>

                                {/* Modern Label */}
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                                    isActive ? "text-maroon translate-y-0 opacity-100" : "text-gray-400 translate-y-1 opacity-60"
                                )}>
                                    {item.label}
                                </span>

                                {/* Bottom Active Pill */}
                                <div className={cn(
                                    "absolute bottom-0 w-1.5 h-1.5 rounded-full bg-maroon transition-all duration-500 scale-0",
                                    isActive && "scale-100 translate-y-[-2px]"
                                )} />
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default MobileNav;
