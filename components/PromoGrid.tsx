'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BannerData {
    title: string;
    subtitle?: string;
    buttonText: string;
    image: string;
    linkUrl: string;
}

interface PromoGridProps {
    banner: BannerData;
    sideBanners?: BannerData[];
    loading?: boolean;
}

const PromoGrid = ({ banner, sideBanners = [], loading }: PromoGridProps) => {

    return (
        <section className="py-8 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Large Banner (7 columns on desktop) */}
                <div className="lg:col-span-7 relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden group shadow-xl">
                    {loading ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse" />
                    ) : (
                        <>
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            {/* Overlay for text legibility */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
                            
                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-lg">
                                <h2 className="text-4xl md:text-6xl font-display font-black text-gray-900 mb-4 leading-tight">
                                    {banner.title}
                                </h2>
                                {banner.subtitle && (
                                    <p className="text-lg md:text-xl text-gray-700 mb-8 font-medium">
                                        {banner.subtitle}
                                    </p>
                                )}
                                <Button
                                    size="lg"
                                    className="w-fit bg-black text-white hover:bg-gray-800 rounded-lg px-8 py-6 text-base font-bold transition-all transform hover:scale-105"
                                    asChild
                                >
                                    <Link href={banner.linkUrl}>
                                        {banner.buttonText}
                                    </Link>
                                </Button>
                                
                                {/* Secondary Branding if needed (like NVIDIA in the screenshot) */}
                                <div className="mt-8 flex items-center gap-2 opacity-80">
                                    <img src="/images/brands/nvidia-logo.png" alt="NVIDIA" className="h-6 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Side: 2x2 Grid (5 columns on desktop) */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4 md:gap-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse rounded-2xl min-h-[220px]" />
                        ))
                    ) : (
                        sideBanners.map((sb, idx) => {
                            // Define some badge colors for variety if buttonText is used as a badge
                            const badgeColors = [
                                'bg-green-100 text-green-700 border-green-200 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600',
                                'bg-purple-100 text-purple-700 border-purple-200 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
                                'bg-blue-100 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
                                'bg-orange-100 text-orange-700 border-orange-200 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600'
                            ];
                            const colorClass = badgeColors[idx % badgeColors.length];

                            return (
                                <Link href={sb.linkUrl || '#'} key={idx} className="rounded-[2rem] p-4 md:p-6 flex flex-col justify-between transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group min-h-[220px] md:min-h-[280px] shadow-sm hover:shadow-xl">
                                    {/* Full Cover Background Image */}
                                    <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110">
                                        <img src={sb.image} alt={sb.title} className="w-full h-full object-cover" />
                                        {/* Subtle overlay to ensure text is always readable against any image */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                        <div>
                                            {sb.buttonText && sb.buttonText !== 'Shop Now' && (
                                                <span className={`inline-block px-3 py-1 text-[10px] md:text-xs font-bold rounded-full mb-3 shadow-md border uppercase tracking-wider backdrop-blur-md ${colorClass} bg-opacity-90`}>
                                                    {sb.buttonText}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-auto">
                                            <h3 className="text-xl md:text-2xl font-display font-bold text-white leading-tight mb-2 drop-shadow-md">
                                                {sb.title}
                                            </h3>
                                            {sb.subtitle && (
                                                <p className="text-gray-200 font-medium text-xs md:text-sm drop-shadow-md max-w-[80%]">
                                                    {sb.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};

export default PromoGrid;
