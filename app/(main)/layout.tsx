'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-bhutan-cream">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
}
