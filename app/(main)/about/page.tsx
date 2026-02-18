'use client';

import { Store, Heart, Users, Award, ShoppingBag, Globe, Clock, Sparkles } from 'lucide-react';
import BackToTop from '@/components/BackToTop';
import AnimatedProductIcons from '@/components/AnimatedProductIcons';
import { ModernTypingText } from '@/components/ModernTypingText';

const About = () => {
    const values = [
        {
            icon: Heart,
            title: 'Customer First',
            description: 'We prioritize our customers needs and strive to exceed their expectations.',
            color: '#FF005C'
        },
        {
            icon: Award,
            title: 'Quality Products',
            description: 'We source only the best products to ensure customer satisfaction.',
            color: '#FFD700'
        },
        {
            icon: Users,
            title: 'Local Support',
            description: 'Our team is based in Bhutan and understands local needs.',
            color: '#00F0FF'
        },
        {
            icon: Store,
            title: 'Wide Selection',
            description: 'From tech products to custom gifts, we have something for everyone.',
            color: '#61FF00'
        },
    ];

    const stats = [
        { label: 'Happy Customers', value: '5000+', icon: Users, color: '#FF00FB' },
        { label: 'Products', value: '1000+', icon: ShoppingBag, color: '#00F0FF' },
        { label: 'Dzongkhags Served', value: '20+', icon: Globe, color: '#FF005C' },
        { label: 'Years Experience', value: '5+', icon: Clock, color: '#61FF00' },
    ];

    return (
        <div className="pt-20">
            <BackToTop />

            {/* Hero */}
            <section className="relative min-h-[500px] flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B15] via-[#1A103C] to-[#2D0F35]">
                    {/* Floating Orbs */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-purple-600 blur-3xl animate-float" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-600 blur-3xl float-slow" />
                        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-pink-600 blur-3xl float-medium" />
                    </div>
                    {/* Gradient Mesh Overlay */}
                    <div className="absolute inset-0 gradient-mesh opacity-30" />
                </div>

                <div className="bhutan-container relative z-10 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left animate-slide-in-right">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-dark backdrop-blur-lg mb-6">
                                <Store className="w-4 h-4 text-saffron animate-pulse" />
                                <span className="text-sm font-medium text-white">Behind the Scenes</span>
                            </div>

                            <div className="min-h-[180px] flex flex-col justify-center mb-6">
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white leading-tight">
                                    Crafting <br />
                                </h1>
                                <ModernTypingText
                                    text="Modern Bhutan"
                                    className="bg-gradient-to-r from-saffron via-gold to-saffron bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto] text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight"
                                    speed={100}
                                    deleteSpeed={50}
                                    pause={3000}
                                    loop={true}
                                    cursor={true}
                                />
                            </div>

                            <p className="text-xl text-white/90 max-w-xl leading-relaxed">
                                We're more than just a store; we're a hub of technology, creativity,
                                and custom craftsmanship dedicated to the people of Bhutan.
                            </p>
                        </div>

                        <div className="relative hidden lg:block scale-75 xl:scale-90 opacity-80 pointer-events-none">
                            <AnimatedProductIcons />
                        </div>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-20 bg-gradient-to-b from-white to-bhutan-cream/30">
                <div className="bhutan-container">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-slide-in-right">
                            <h2 className="text-4xl font-display font-bold mb-6 bg-gradient-to-r from-maroon to-saffron bg-clip-text text-transparent flex items-center gap-3">
                                <Sparkles className="w-8 h-8 text-saffron animate-pulse" />
                                Our Story
                            </h2>
                            <div className="space-y-5 text-lg leading-relaxed">
                                <p className="text-muted-foreground">
                                    Founded with a vision to bring quality technology products and custom printing
                                    services to the people of Bhutan, Our Store has grown to become one of the
                                    most trusted names in the industry.
                                </p>
                                <p className="text-muted-foreground">
                                    We started as a small shop in Thimphu, offering photo printing services.
                                    Today, we offer a wide range of products including custom photo frames,
                                    t-shirt printing, CCTV systems, and the latest tech gadgets.
                                </p>
                                <p className="text-muted-foreground">
                                    Our commitment to quality, customer service, and competitive pricing has
                                    earned us the trust of thousands of customers across the country.
                                </p>
                            </div>
                        </div>
                        <div className="relative animate-slide-in-up">
                            <div className="absolute -inset-6 bg-gradient-to-r from-saffron via-gold to-maroon rounded-3xl opacity-40 blur-3xl animate-pulse-slow" />
                            <div className="relative glass rounded-3xl p-2 shadow-bhutan-xl">
                                <img
                                    src="/images/about-store.jpg"
                                    alt="Our Store"
                                    className="relative rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/8B2635/white?text=Our+Store';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-white mandala-pattern">
                <div className="bhutan-container">
                    <div className="text-center mb-14 animate-slide-in-up">
                        <h2 className="text-4xl font-display font-bold mb-5 bg-gradient-to-r from-maroon via-saffron to-gold bg-clip-text text-transparent">
                            Our Values
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            These core principles guide everything we do
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={value.title}
                                className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-white/50 transition-all duration-700 shadow-xl hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] transform hover:-translate-y-3"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Modern Value Icon with Tinted Glass */}
                                <div className="relative w-16 h-16 mx-auto mb-6">
                                    <div className="absolute inset-0 opacity-10 blur-xl group-hover:opacity-25 transition-all duration-700 rounded-2xl"
                                        style={{ background: value.color }}
                                    />
                                    <div
                                        className="relative h-full w-full rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-md backdrop-blur-md"
                                        style={{
                                            background: `rgba(255, 255, 255, 0.4)`,
                                            backgroundColor: `${value.color}0D`,
                                            borderColor: `${value.color}33`
                                        }}
                                    >
                                        <value.icon
                                            className="w-8 h-8 transition-all duration-700"
                                            style={{ stroke: value.color }}
                                        />
                                    </div>
                                </div>

                                <h3 className="font-display font-bold text-lg mb-3 text-gray-900 group-hover:text-maroon transition-colors duration-300">
                                    {value.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                                    {value.description}
                                </p>

                                {/* Decorative underline */}
                                <div
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full opacity-10 group-hover:w-16 group-hover:opacity-60 transition-all duration-700"
                                    style={{ background: value.color }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 bg-gradient-to-b from-white to-bhutan-cream/30 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-saffron/5 blur-[80px] rounded-full -translate-x-1/2" />

                <div className="bhutan-container relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-white/50 transition-all duration-700 shadow-xl hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] transform hover:-translate-y-3 animate-scale-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Modern Stat Icon with Tinted Glass */}
                                <div className="relative w-16 h-16 mx-auto mb-6">
                                    <div className="absolute inset-0 opacity-10 blur-xl group-hover:opacity-25 transition-all duration-700 rounded-2xl"
                                        style={{ background: stat.color }}
                                    />
                                    <div
                                        className="relative h-full w-full rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-md backdrop-blur-md"
                                        style={{
                                            background: `rgba(255, 255, 255, 0.4)`,
                                            backgroundColor: `${stat.color}0D`,
                                            borderColor: `${stat.color}33`
                                        }}
                                    >
                                        <stat.icon
                                            className="w-8 h-8 transition-all duration-700"
                                            style={{ stroke: stat.color }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 group-hover:bg-gradient-to-r group-hover:from-maroon group-hover:to-saffron transition-all duration-500">
                                        {stat.value}
                                    </p>
                                    <p className="text-muted-foreground font-medium text-sm md:text-base">{stat.label}</p>
                                </div>

                                {/* Decorative underline */}
                                <div
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full opacity-10 group-hover:w-16 group-hover:opacity-60 transition-all duration-700"
                                    style={{ background: stat.color }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-800 to-bhutan-blue">
                    <div className="absolute inset-0 mandala-pattern opacity-10" />
                    <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-saffron/20 blur-3xl float-slow" />
                    <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/20 blur-3xl float-medium" />
                </div>

                <div className="bhutan-container relative z-10 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Get in{' '}
                        <span className="bg-gradient-to-r from-saffron via-gold to-saffron bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                            Touch
                        </span>
                    </h2>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Have questions or need assistance? We're here to help!
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 rounded-lg font-medium shadow-2xl hover:shadow-glow-lg transform hover:scale-110 transition-all duration-300 text-lg"
                    >
                        Contact Us
                    </a>
                </div>
            </section>
        </div>
    );
};

export default About;
