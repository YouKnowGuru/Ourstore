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
        {
            label: 'Categories',
            icon: LayoutGrid,
            href: '/#categories',
        },
        {
            label: 'Services',
            icon: Wrench,
            href: '/#features',
        },
        {
            label: 'About',
            icon: Info,
            href: '/about',
        },
        {
            label: 'Products',
            icon: ShoppingBag,
            href: '/products',
        },
        {
            label: 'Contact',
            icon: Phone,
            href: '/contact',
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] animate-fade-in shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-2">
                <nav className="flex items-center justify-between max-w-md mx-auto relative h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href.startsWith('/#') && pathname === '/');

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 flex-1",
                                    isActive ? "text-maroon" : "text-gray-400"
                                )}
                            >
                                {/* Active Backdrop Glow */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-maroon/5 rounded-2xl blur-md -z-10 animate-pulse-slow" />
                                )}

                                {/* Icon Container */}
                                <div className={cn(
                                    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500",
                                    isActive
                                        ? "bg-gradient-to-br from-maroon to-maroon-700 text-white shadow-glow-maroon scale-110 -translate-y-1"
                                        : "hover:bg-gray-100 hover:text-gray-600"
                                )}>
                                    <item.icon className={cn("w-5 h-5 transition-transform duration-500", isActive && "rotate-[-3deg]")} />

                                    {/* Active Indicator dot */}
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-tight transition-all duration-300",
                                    isActive ? "text-maroon scale-100" : "text-gray-400 scale-90 opacity-70"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default MobileNav;
