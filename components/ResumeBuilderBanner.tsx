'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/lib/hooks/useProducts';

const ResumeBuilderBanner = () => {
    const { featuredProducts, getFeaturedProducts } = useProducts();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        getFeaturedProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Extract product images
    const defaultImages = [
        '/images/Ourstoreresume builder.png',
        '/images/Ourstoreresume builder.png', 
        '/images/Ourstoreresume builder.png',
    ];

    const productImages = featuredProducts && featuredProducts.length > 0
        ? featuredProducts.map(p => p.images[0]).filter(Boolean).slice(0, 5)
        : defaultImages;

    // Ensure we have at least 3 images for the 3D effect
    const displayImages = productImages.length >= 3 
        ? productImages 
        : [...productImages, ...productImages, ...productImages].slice(0, 3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [displayImages.length]);

    return (
        <div className="py-12 md:py-20 w-full overflow-hidden bg-white">
            <div className="bhutan-container relative z-10 max-w-7xl mx-auto">
                {/* Main Card Container like image */}
                <div className="bg-gradient-to-r from-[#FFF9F6] to-white flex flex-col lg:flex-row items-center justify-between rounded-[2.5rem] p-8 md:p-14 lg:p-20 border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] gap-12 lg:gap-20">
                    
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 space-y-8 shrink-0">
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-gray-900 leading-[1.1] font-bold"
                        >
                            Design Your <br />
                            <span className="bg-gradient-to-r from-[#e86036] via-[#f7a048] to-[#e86036] bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                                Future Resume
                            </span>
                        </motion.h2>

                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed"
                        >
                            Start out with a high-impact, ATS-optimized resume. 
                            Our professional generator gets your story into a 
                            compelling career tool in under 5 minutes.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-5 pt-6"
                        >
                            <Button
                                size="lg"
                                className="h-16 bg-[#111111] hover:bg-black text-white rounded-2xl px-12 font-bold text-[16px] shadow-lg shadow-black/10 transition-transform active:scale-95 group"
                                asChild
                            >
                                <a href="https://resume-builder-jet-nine.vercel.app/" target="_blank" rel="noopener noreferrer">
                                    Start Building
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>
                            
                            <a href="#" className="flex items-center gap-2 text-[16px] text-gray-500 hover:text-gray-900 font-semibold transition-colors px-6 py-4 rounded-xl hover:bg-gray-50">
                                <FileText className="w-6 h-6 text-gray-400" />
                                Sample Template
                            </a>
                        </motion.div>
                    </div>

                    {/* Right Content - 3D Slider Area */}
                    <div className="w-full lg:w-1/2 relative min-h-[480px] lg:min-h-[560px] flex items-center justify-center pt-8">
                        
                        {/* Soft white background frame from image */}
                        <div className="absolute inset-0 bg-[#fbfbfb] rounded-[3rem] shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] border border-[#f3f3f3] w-full max-w-[560px] mx-auto min-h-[480px] lg:min-h-[560px]" />

                        {/* 3D Container for Slider */}
                        <div className="relative w-full max-w-[400px] h-[440px] perspective-1000 z-10 pt-4">
                            <AnimatePresence initial={false}>
                                {displayImages.map((img, index) => {
                                    // Calculate relative position based on current index
                                    const length = displayImages.length;
                                    const diff = (index - currentIndex + length) % length;
                                    
                                    let zIndex = 0;
                                    let x = 0;
                                    let scale = 1;
                                    let opacity = 0;
                                    let rotateY = 0;
                                    let z = 0;

                                    if (diff === 0) {
                                        // Active front card
                                        zIndex = 30;
                                        x = 0;
                                        scale = 1;
                                        opacity = 1;
                                        rotateY = 0;
                                        z = 0;
                                    } else if (diff === 1) {
                                        // Next card (shadowed, slightly right and back)
                                        zIndex = 20;
                                        x = 55;
                                        scale = 0.9;
                                        opacity = 0.9;
                                        rotateY = -12;
                                        z = -80;
                                    } else if (diff === 2 && length >= 3) {
                                        // Prev card (shadowed, slightly left and back)
                                        zIndex = 10;
                                        x = -55;
                                        scale = 0.9;
                                        opacity = 0.9;
                                        rotateY = 12;
                                        z = -80;
                                    }

                                    if (opacity === 0) return null;

                                    return (
                                        <motion.div
                                            key={`${img}-${index}`}
                                            initial={{ opacity: 0, x: 100, scale: 0.8, rotateY: -30 }}
                                            animate={{ x, scale, opacity, rotateY, z }}
                                            exit={{ opacity: 0, x: -100, scale: 0.8, rotateY: 30 }}
                                            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                                            className="absolute inset-0 bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-50 flex flex-col overflow-hidden mx-auto max-w-[340px]"
                                            style={{ zIndex, transformOrigin: 'center center' }}
                                        >
                                            {/* Store Header branding */}
                                            <div className="px-6 py-5 text-center border-b border-gray-50 flex flex-col items-center justify-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center">
                                                    <div className="w-5 h-5 rounded-sm border-2 border-saffron rotate-45" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-[15px] tracking-tight">Welcome to Our Store</h3>
                                            </div>

                                            {/* Product Image Section */}
                                            <div className="flex-1 px-8 py-6 bg-white flex flex-col justify-center items-center gap-6">
                                                <div className="w-full h-48 relative flex items-center justify-center">
                                                    <img src={img} alt="Product display" className="max-w-full max-h-full object-contain drop-shadow-lg transform transition-transform duration-500 hover:scale-105" />
                                                </div>
                                                
                                                {/* Line placeholders for text */}
                                                <div className="w-full space-y-3 mt-4">
                                                    <div className="h-2 w-full bg-gray-100 rounded-full flex gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-saffron/80 -mt-[4px]" />
                                                    </div>
                                                    <div className="h-2 w-4/5 bg-gray-100 rounded-full" />
                                                    <div className="h-2 w-[60%] bg-gray-100 rounded-full" />
                                                </div>
                                            </div>

                                            {/* Bottom Action */}
                                            <div className="px-8 pb-8 bg-white">
                                                <div className="w-full py-4 bg-gradient-to-r from-[#FFB800] to-[#FFA800] rounded-xl flex items-center justify-center text-white font-bold text-[14px] shadow-md shadow-saffron/20 group hover:opacity-90 transition-opacity cursor-pointer">
                                                    Build Resume
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                        
                        {/* Red Sticky Label overlapping the carousel container */}
                        <motion.div 
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-10 lg:bottom-16 right-4 md:right-10 lg:right-16 bg-[#BC3D3D] text-white px-6 py-3.5 rounded-l-2xl rounded-b-2xl shadow-xl z-50 transform -rotate-6 backdrop-blur-sm"
                        >
                            <span className="text-sm sm:text-base font-black tracking-widest block text-center shadow-sm">100% FREE</span>
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-tight opacity-80 block text-center mt-0.5">No hidden costs</span>
                            
                            {/* Realistic fold accent */}
                            <div className="absolute top-0 right-0 w-5 h-5 bg-red-900 translate-x-3.5 -translate-y-[10px] transform rotate-[130deg] -z-10 blur-[1px]" />
                        </motion.div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .perspective-1000 { perspective: 1000px; }
            `}} />
        </div>
    );
};

export default ResumeBuilderBanner;
