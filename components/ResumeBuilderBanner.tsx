import { useState, useEffect } from 'react';
import { FileText, ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResumeBuilderBanner = () => {
    const mounted = typeof window !== 'undefined';
    const [particles, setParticles] = useState<{ top: string; left: string; delay: string; duration: string }[]>([]);

    useEffect(() => {
        const newParticles = [...Array(6)].map((_, i) => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: `${i * 1.5}s`,
            duration: `${5 + Math.random() * 5}s`
        }));

        const timer = setTimeout(() => {
            setParticles(newParticles);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Background Aesthetic Layers */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-saffron/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-maroon/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3" />

            {/* Moving Light Particles */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {mounted && particles.map((p, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-saffron rounded-full animate-float"
                        style={{
                            top: p.top,
                            left: p.left,
                            animationDelay: p.delay,
                            animationDuration: p.duration
                        }}
                    />
                ))}
            </div>

            <div className="bhutan-container relative z-10">
                <div className="relative group p-[2px] rounded-[3rem] bg-gradient-to-r from-saffron via-maroon to-gold animate-gradient-shift bg-[length:200%_auto] shadow-[0_30px_100px_-20px_rgba(255,107,37,0.15)] transition-all duration-700 hover:shadow-glow-saffron/30">

                    {/* Main Banner Container */}
                    <div className="relative overflow-hidden rounded-[2.9rem] bg-gradient-to-br from-white via-stone-50 to-stone-100 flex flex-col lg:flex-row items-center justify-between">

                        {/* Interactive Holographic Background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-0 left-1/4 w-full h-px bg-gradient-to-r from-transparent via-saffron/20 to-transparent -translate-y-full group-hover:translate-y-[800px] transition-all [transition-duration:3000ms] ease-linear" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,107,53,0.05),transparent_50%)]" />
                        </div>

                        {/* Content Section */}
                        <div className="relative z-10 flex-1 px-8 py-16 md:px-20 md:py-24 space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white shadow-[0_4px_15px_-3px_rgba(0,0,0,0.08)] border border-stone-200/60 text-saffron-600 font-bold text-xs uppercase tracking-widest animate-fade-in group-hover:scale-105 transition-transform duration-500">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                <span>AI-Powered Career Growth</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-display font-black text-stone-900 leading-[1.1] tracking-tight">
                                Design Your <br />
                                <span className="relative inline-block mt-2">
                                    <span className="relative z-10 bg-gradient-to-r from-saffron via-maroon to-gold bg-clip-text text-transparent">
                                        Future Resume
                                    </span>
                                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-saffron/10 -skew-x-12 rounded-sm" />
                                </span>
                            </h2>

                            <p className="text-xl text-stone-600/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Stand out with a high-impact, ATS-optimized resume. Our professional generator
                                crafts your story into a compelling career tool in under 5 minutes.
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6">
                                <Button
                                    size="lg"
                                    className="relative overflow-hidden bg-stone-950 text-white hover:bg-stone-900 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transform hover:scale-105 active:scale-95 transition-all duration-300 px-10 py-8 rounded-[1.5rem] text-xl font-black group/btn"
                                    asChild
                                >
                                    <a
                                        href="https://resume-builder-jet-nine.vercel.app/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            Start Building
                                            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                        </span>
                                        {/* CSS Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-all duration-1000 ease-in-out" />
                                    </a>
                                </Button>

                                <div className="flex flex-col items-center lg:items-start gap-1">
                                    <div className="flex items-center gap-2 text-stone-400 font-bold text-sm tracking-wide">
                                        <Wand2 className="w-4 h-4 text-maroon" />
                                        <span>7+ Smart Templates</span>
                                    </div>
                                    <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-saffron w-2/3 animate-shimmer bg-[length:200%_100%]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Perspective Section */}
                        <div className="relative flex-1 w-full px-8 pb-16 lg:pb-0 lg:pr-20 overflow-visible">
                            <div className="relative perspective-1000 group-hover:rotate-y-12 transition-all duration-1000 ease-out">

                                {/* 3D Hovering Resume Cards */}
                                <div className="relative aspect-[4/5] max-w-[380px] mx-auto bg-white rounded-[2rem] border border-stone-200/50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-8 overflow-hidden transform-style-3d animate-float">

                                    {/* Scanning Light Effect */}
                                    <div className="absolute top-0 left-0 w-full h-[150%] bg-gradient-to-b from-transparent via-saffron/10 to-transparent -translate-y-full animate-[scan_4s_linear_infinite]" />

                                    <div className="absolute inset-0 bg-bhutan-pattern opacity-[0.02] mix-blend-overlay" />

                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron/20 to-maroon/20 flex items-center justify-center shadow-inner">
                                                <FileText className="text-stone-900 w-8 h-8" />
                                            </div>
                                            <div className="space-y-2.5 flex-1">
                                                <div className="h-5 w-4/5 bg-stone-900/10 rounded-full" />
                                                <div className="h-3.5 w-1/2 bg-stone-900/5 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-stone-100">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="h-2 w-full bg-stone-100 rounded-full" />
                                                    <div className="h-2 w-3/4 bg-stone-50 rounded-full" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-6">
                                            <div className="h-24 rounded-2xl bg-stone-50/50 border border-stone-100 flex items-end p-3">
                                                <div className="h-2 w-full bg-stone-200 rounded-full" />
                                            </div>
                                            <div className="h-24 rounded-2xl bg-stone-50/50 border border-stone-100 flex items-end p-3">
                                                <div className="h-2 w-2/3 bg-stone-200 rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Iridescent Bottom Accent */}
                                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-saffron via-maroon to-gold opacity-50" />
                                </div>

                                {/* Floating Badge - Better Styled */}
                                <div className="absolute -bottom-10 -left-6 md:-bottom-4 md:-left-8 bg-maroon text-white px-6 py-4 rounded-3xl shadow-[0_20px_40px_-10px_rgba(139,38,53,0.4)] border-2 border-white/20 transform -rotate-12 group-hover:rotate-0 transition-all duration-700">
                                    <p className="flex flex-col items-center">
                                        <span className="text-xs uppercase tracking-tighter opacity-70">Unlock Now</span>
                                        <span className="text-2xl font-black">100% FREE</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
            `}} />
        </div>
    );
};

export default ResumeBuilderBanner;
