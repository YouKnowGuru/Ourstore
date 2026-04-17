'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface CategoryItem {
    name: string;
    image: string;
}

interface CategoryCirclesProps {
    categories: CategoryItem[];
    loading?: boolean;
}

const CategoryCircles = ({ categories, loading }: CategoryCirclesProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return (
            <div className="flex gap-6 overflow-x-auto no-scrollbar py-8">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-3 w-12 bg-gray-200 animate-pulse rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className="relative group/nav overflow-hidden">
            <div 
                ref={scrollRef}
                className="flex items-start gap-4 md:gap-8 overflow-x-auto no-scrollbar py-6 scroll-smooth px-2"
            >
                {categories.map((category) => (
                    <Link
                        key={category.name}
                        href={`/products?category=${encodeURIComponent(category.name)}`}
                        className="flex flex-col items-center gap-3 shrink-0 group"
                    >
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-saffron group-hover:shadow-glow-saffron transition-all duration-300">
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay for subtle depth */}
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 group-hover:text-maroon transition-colors text-center uppercase tracking-wider">
                            {category.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryCircles;
