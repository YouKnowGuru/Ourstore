'use client';

import { FileText, ShieldCheck, Scale, Globe, Landmark, Clock, Award } from 'lucide-react';
import BackToTop from '@/components/BackToTop';
import Image from 'next/image';

const TermsAndConditions = () => {
    const licenseDetails = [
        { label: 'License Number', value: 'R3005525', icon: ShieldCheck },
        { label: 'Issued Date', value: '31-08-2022', icon: Clock },
        { label: 'Valid Until', value: '30-08-2026', icon: Award },
        { label: 'Dzongkhag', value: 'Tsirang', icon: Landmark },
    ];

    return (
        <div className="pt-20 bg-stone-50 min-h-screen">
            <BackToTop />

            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-to-br from-maroon via-maroon-800 to-bhutan-blue overflow-hidden">
                <div className="absolute inset-0 mandala-pattern opacity-10" />
                <div className="absolute top-20 right-10 w-96 h-96 bg-saffron/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-gold/10 blur-[100px] rounded-full float-medium" />

                <div className="bhutan-container relative z-10 text-center text-white">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group hover:bg-white/20 transition-all duration-300">
                        <Scale className="w-4 h-4 text-saffron" />
                        <span className="text-sm font-bold tracking-widest uppercase">Legal Compliance</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black mb-6 tracking-tight">
                        Terms & <span className="text-saffron">Conditions</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                        Governing the use of Our Store e-commerce platform in accordance with
                        the laws of the Kingdom of Bhutan.
                    </p>
                </div>
            </section>

            {/* License Quick Info */}
            <section className="py-12 -mt-16 relative z-20">
                <div className="bhutan-container">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {licenseDetails.map((detail) => (
                            <div key={detail.label} className="glass border-white/40 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center group-hover:bg-saffron/20 transition-colors">
                                        <detail.icon className="w-6 h-6 text-maroon" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-0.5">{detail.label}</p>
                                        <p className="text-lg font-display font-bold text-gray-900 tracking-tight">{detail.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="bhutan-container">
                    <div className="max-w-4xl mx-auto space-y-16">

                        {/* Introduction */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-display font-bold text-maroon flex items-center gap-3">
                                <FileText className="w-7 h-7" />
                                1. Introduction
                            </h2>
                            <div className="prose prose-stone max-w-none text-muted-foreground text-lg leading-relaxed">
                                <p>
                                    Welcome to <strong>Our Store</strong>. These Terms and Conditions constitute a legally binding agreement between you and <strong>Our Store</strong> regarding your access to and use of our website (ourstore.tech) and all related services.
                                </p>
                                <p>
                                    By using our services, you confirm that you have read, understood, and agreed to be bound by these terms. If you do not agree, please discontinue use immediately.
                                </p>
                            </div>
                        </div>

                        {/* Business Compliance */}
                        <div className="space-y-6 p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-maroon/10 transition-colors" />
                            <h2 className="text-3xl font-display font-bold text-maroon flex items-center gap-3">
                                <Landmark className="w-7 h-7" />
                                2. Business Identity & Compliance
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8 text-lg font-medium">
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">
                                        <span className="text-gray-900 block font-black uppercase text-xs tracking-widest mb-1">Establishment Name</span>
                                        Our Store
                                    </p>
                                    <p className="text-muted-foreground">
                                        <span className="text-gray-900 block font-black uppercase text-xs tracking-widest mb-1">Activity Type</span>
                                        Retail sale via mail order house or via internet (e-Commerce Platform Operator)
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">
                                        <span className="text-gray-900 block font-black uppercase text-xs tracking-widest mb-1">Licensed By</span>
                                        Ministry of Industry, Commerce & Employment, RGoB
                                    </p>
                                    <p className="text-muted-foreground">
                                        <span className="text-gray-900 block font-black uppercase text-xs tracking-widest mb-1">Registered Address</span>
                                        Dungkhar Choeling, Damphu Town, Tsirang, Bhutan
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Registration License Display */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-display font-bold text-maroon flex items-center gap-3">
                                <Award className="w-7 h-7" />
                                Official Business License
                            </h2>
                            <div className="relative group rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-white">
                                <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-10 pointer-events-none">
                                    <Globe className="w-20 h-20 text-maroon opacity-20 animate-spin-slow" />
                                </div>
                                {/* Used standard img tag as Next.js Image might require width/height if static import not used correctly or if external, but importing static image works with Image */}
                                <Image
                                    src="/images/Licence_page-0001.jpg"
                                    alt="Our Store Business License"
                                    className="w-full h-auto grayscale-[20%] hover:grayscale-0 transition-all duration-700 transform hover:scale-[1.02]"
                                    width={800}
                                    height={1131}
                                    placeholder="empty"
                                />
                            </div>
                            <p className="text-center text-sm text-muted-foreground italic font-medium">
                                Official E-Certificate issued by the Royal Government of Bhutan.
                            </p>
                        </div>

                        {/* User Agreement & Rules */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-display font-bold text-maroon flex items-center gap-3">
                                <ShieldCheck className="w-7 h-7" />
                                Legal Framework
                            </h2>
                            <div className="grid gap-6">
                                {[
                                    {
                                        title: "Bhutanese E-Commerce Standards",
                                        desc: "Our Store strictly adheres to the professional standards set by the Ministry of Industry, Commerce & Employment (RGoB). Our e-commerce operations are fully compliant with the national regulations."
                                    },
                                    {
                                        title: "User Responsibilities",
                                        desc: "Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account."
                                    },
                                    {
                                        title: "Governing Law",
                                        desc: "These terms are governed by the laws of the Kingdom of Bhutan. Any disputes shall be subject to the exclusive jurisdiction of the Royal Courts of Justice."
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-8 rounded-3xl bg-maroon/[0.02] border border-maroon/10 hover:bg-maroon/[0.04] transition-colors duration-300">
                                        <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center shrink-0 font-bold text-maroon">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-display font-bold text-xl text-gray-900 mb-2">{item.title}</h4>
                                            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Final Note */}
                        <div className="pt-10 border-t border-gray-100 text-center">
                            <p className="text-muted-foreground font-medium">
                                For any clarifications regarding these terms, please contact us at <br />
                                <span className="text-maroon font-bold">tsirang@ourstore.tech</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-4 uppercase tracking-[0.2em] font-black opacity-50">
                                Last Updated: Feb 2026
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsAndConditions;
