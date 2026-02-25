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
 * MobileNav - A premium bottom navigation bar for mobile devices.
 * Features a native-style sliding indicator and responsive animations.
 */
const MobileNav = () => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Categories', icon: LayoutGrid, href: '/categories' },
        { label: 'Services', icon: Wrench, href: '/services' },
        { label: 'About', icon: Info, href: '/about' },
        { label: 'Products', icon: ShoppingBag, href: '/products' },
        { label: 'Contact', icon: Phone, href: '/contact' },
    ];

    const activeIndex = navItems.findIndex(item =>
        pathname === item.href || (item.href.startsWith('/#') && pathname === '/')
    );

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe">
            <div className="max-w-md mx-auto relative px-2 py-2 h-16">
                {/* Sliding Indicator Background */}
                <div
                    className="absolute top-2 bottom-2 bg-maroon/10 rounded-2xl transition-all duration-500 [transition-timing-function:cubic-bezier(0.68,-0.55,0.265,1.55)] z-0"
                    style={{
                        width: `calc(${100 / navItems.length}% - 12px)`,
                        left: `calc(${activeIndex * (100 / navItems.length)}% + 6px)`,
                        display: activeIndex === -1 ? 'none' : 'block'
                    }}
                />

                <nav className="flex items-center justify-between h-full relative z-10">
                    {navItems.map((item, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300 active:scale-90",
                                    isActive ? "text-maroon" : "text-gray-400"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl transition-all duration-500",
                                    isActive ? "bg-maroon text-white shadow-lg -translate-y-1" : "hover:text-gray-600"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-transform duration-500",
                                        isActive && "animate-pulse-slow rotate-[5deg]"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                                    isActive ? "opacity-100 scale-100" : "opacity-60 scale-95"
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
