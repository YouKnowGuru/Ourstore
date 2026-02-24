'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileNav from '@/components/MobileNav';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-bhutan-cream pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <CartDrawer />
            <MobileNav />
        </div>
    );
}
