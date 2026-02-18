import { Camera, Cctv, Shirt, Cpu, Image, Monitor, Smartphone, Printer } from 'lucide-react';

const AnimatedProductIcons = () => {
    const products = [
        { Icon: Image, delay: '0s', position: 'top-10 left-10', colors: ['#FF00FB', '#4200FF'], id: 'grad-image' },
        { Icon: Cctv, delay: '0.5s', position: 'top-20 right-20', colors: ['#00F0FF', '#0047FF'], id: 'grad-cctv' },
        { Icon: Shirt, delay: '1s', position: 'bottom-32 left-20', colors: ['#FF005C', '#FFBD00'], id: 'grad-shirt' },
        { Icon: Camera, delay: '1.5s', position: 'top-40 right-10', colors: ['#00FF85', '#00A3FF'], id: 'grad-camera' },
        { Icon: Cpu, delay: '2s', position: 'bottom-20 right-32', colors: ['#7000FF', '#FF00FB'], id: 'grad-cpu' },
        { Icon: Monitor, delay: '2.5s', position: 'top-32 left-32', colors: ['#BDFB00', '#00FF85'], id: 'grad-monitor' },
        { Icon: Smartphone, delay: '3s', position: 'bottom-40 left-40', colors: ['#FFD600', '#FF005C'], id: 'grad-phone' },
        { Icon: Printer, delay: '3.5s', position: 'top-1/2 right-20', colors: ['#61FF00', '#00FFF0'], id: 'grad-printer' },
    ];

    return (
        <div className="relative w-full h-[500px] animate-slide-in-up">
            {/* Defined SVG Gradients for Every Icon */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    {products.map((p) => (
                        <linearGradient key={p.id} id={p.id} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: p.colors[0], stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: p.colors[1], stopOpacity: 1 }} />
                        </linearGradient>
                    ))}
                </defs>
            </svg>

            {/* Central Cyber Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[450px] h-[450px] rounded-full bg-gradient-to-r from-[#7000FF]/10 via-[#FF00FB]/5 to-[#00F0FF]/10 blur-[120px] animate-pulse-slow" />
            </div>

            {/* Floating Product Icons */}
            {products.map((product, index) => (
                <div
                    key={index}
                    className={`absolute ${product.position} animate-float`}
                    style={{
                        animationDelay: product.delay,
                        animationDuration: `${5 + (index % 4)}s`
                    }}
                >
                    <div className="group relative">
                        {/* Multi-layered Cyber Glow */}
                        <div
                            className="absolute -inset-8 opacity-0 group-hover:opacity-40 blur-3xl transition-all duration-700 rounded-full"
                            style={{ background: `radial-gradient(circle, ${product.colors[0]}33 0%, transparent 70%)` }}
                        />

                        {/* Tinted Glass Container */}
                        <div
                            className="relative rounded-[2rem] p-6 shadow-2xl border transition-all duration-700 backdrop-blur-3xl group-hover:scale-110 group-hover:-rotate-3"
                            style={{
                                background: `rgba(255, 255, 255, 0.4)`,
                                backgroundColor: `${product.colors[0]}0D`, // 5% opacity
                                borderColor: `${product.colors[0]}33`, // 20% opacity
                                boxShadow: `0 20px 50px -12px rgba(0,0,0,0.1), 0 0 20px ${product.colors[0]}1A`
                            }}
                        >
                            <product.Icon
                                className="w-12 h-12 md:w-16 md:h-16 transition-all duration-500 animate-pulse-slow"
                                style={{
                                    stroke: `url(#${product.id})`,
                                    filter: `drop-shadow(0 0 12px ${product.colors[0]}66)`
                                }}
                            />

                            {/* Inner accent glow */}
                            <div
                                className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                                style={{ background: `linear-gradient(135deg, ${product.colors[0]}, ${product.colors[1]})` }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnimatedProductIcons;
