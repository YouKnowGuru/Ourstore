'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

interface DailyDealsProps {
    categories: string[];
    products: Product[];
    loading?: boolean;
}

const DailyDeals = ({ categories, products, loading }: DailyDealsProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter to only get 4 products for the 2x2 grid
    const displayProducts = products.slice(0, 4);

    if (!loading && categories.length === 0 && products.length === 0) return null;

    return (
        <section className="py-12 bg-bhutan-cream/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="bhutan-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-saffron mb-1">
                            <div className="w-8 h-px bg-saffron" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exclusive deals</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-gray-900 uppercase">
                            DAILY DEALS
                        </h2>
                    </div>
                </div>

                {/* Category Chips - Dynamic */}
                <div className="relative mb-12">
                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth"
                    >
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-10 w-24 bg-white/50 animate-pulse rounded-full shrink-0" />
                            ))
                        ) : (
                            categories.map((category) => (
                                <Link
                                    key={category}
                                    href={`/products?category=${encodeURIComponent(category)}`}
                                    className="px-6 py-2.5 rounded-full bg-white border border-gray-100 whitespace-nowrap text-sm font-bold text-gray-600 hover:bg-saffron hover:text-white hover:border-saffron hover:shadow-glow-saffron transition-all duration-300 transform hover:-translate-y-1 shadow-sm"
                                >
                                    {category}
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* 2x2 Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-80 bg-white/50 animate-pulse rounded-3xl" />
                        ))
                    ) : (
                        displayProducts.map((product) => (
                            <div key={product._id} className="relative group">
                                <ProductCard product={product} />
                            </div>
                        ))
                    )}
                </div>

                {/* View All Button */}
                <div className="mt-12 text-center">
                    <Button
                        variant="ghost"
                        className="group text-gray-900 font-black tracking-widest uppercase text-xs hover:bg-transparent"
                        asChild
                    >
                        <Link href="/products" className="flex items-center gap-2">
                            Browse All Products
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default DailyDeals;
