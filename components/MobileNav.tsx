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
import { useSelector } from 'react-redux';
import { selectCartCount } from '@/lib/store/slices/cartSlice';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * MobileNav - A premium bottom navigation bar for mobile devices.
 * Features a native-style sliding indicator and responsive animations.
 */
const MobileNav = () => {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const cartCount = useSelector(selectCartCount);

    const navItems = [
        { label: 'Categories', icon: LayoutGrid, href: '/categories' },
        { label: 'Services', icon: Wrench, href: '/services' },
        { label: 'About', icon: Info, href: '/about' },
        { label: 'Products', icon: ShoppingBag, href: '/products' },
        { label: 'Contact', icon: Phone, href: '/contact' },
    ];

    const activeIndex = navItems.findIndex(item =>
        pathname === item.href
    );

    return (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-40 px-6">
            <div className="max-w-md mx-auto bg-[#1A0A0C]/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                <nav className="flex items-center justify-between px-3 py-2">
                    {navItems.map((item, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center py-2 px-1 flex-1 gap-1 transition-all duration-300",
                                    isActive ? "text-[#FF6B35]" : "text-white/50 hover:text-white/80"
                                )}
                            >
                                {/* Active State Background Bubble */}
                                {isActive && (
                                    <div className="absolute inset-x-1 inset-y-1 bg-[#8B2635]/20 rounded-3xl z-0 border border-white/5" />
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-1.5">
                                    <div className="relative">
                                        <item.icon className={cn(
                                            "w-6 h-6 transition-all duration-300",
                                            isActive ? "text-[#FF6B35] scale-110" : "text-white/50"
                                        )} />
                                    </div>

                                    <span className={cn(
                                        "text-[10px] font-medium tracking-tight transition-all duration-300",
                                        isActive ? "text-[#FF6B35]" : "text-white/50"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default MobileNav;
