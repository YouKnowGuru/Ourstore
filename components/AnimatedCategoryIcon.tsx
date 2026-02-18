import { Camera, Cctv, Shirt, Image } from 'lucide-react';

interface AnimatedCategoryIconProps {
    categoryName: string;
}

const AnimatedCategoryIcon = ({ categoryName }: AnimatedCategoryIconProps) => {
    const getIconData = () => {
        switch (categoryName) {
            case 'Photo Frames':
                return { Icon: Image, colors: ['#FFD700', '#FF00FB'], id: 'cat-grad-photo' };
            case 'T-Shirt Printing':
                return { Icon: Shirt, colors: ['#FF005C', '#7000FF'], id: 'cat-grad-shirt' };
            case 'CCTV Systems':
                return { Icon: Cctv, colors: ['#00F0FF', '#0047FF'], id: 'cat-grad-cctv' };
            case 'Tech Products':
                return { Icon: Camera, colors: ['#61FF00', '#00FFF0'], id: 'cat-grad-tech' };
            default:
                return { Icon: Image, colors: ['#FFD600', '#FF6347'], id: 'cat-grad-default' };
        }
    };

    const { Icon, colors, id } = getIconData();

    return (
        <div className="absolute inset-0 flex items-center justify-center z-10 p-6 pointer-events-none">
            <div className="group relative w-full h-full flex items-center justify-center">
                {/* Iridescent Layered Glow */}
                <div
                    className="absolute w-40 h-40 opacity-10 blur-[60px] group-hover:opacity-30 transition-all duration-1000 animate-pulse-slow"
                    style={{ background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)` }}
                />

                {/* Tinted Glass Container */}
                <div
                    className="relative border rounded-[3rem] p-12 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 animate-float backdrop-blur-3xl"
                    style={{
                        background: `rgba(255, 255, 255, 0.4)`,
                        backgroundColor: `${colors[0]}0D`, // 5% opacity
                        borderColor: `${colors[0]}33`, // 20% opacity
                        boxShadow: `0 25px 60px -15px rgba(0,0,0,0.1), 0 0 30px ${colors[0]}1A`
                    }}
                >
                    {/* Inner Glow Detail */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-[3rem] transition-all duration-700"
                        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                    />

                    <Icon
                        className="w-24 h-24 md:w-28 md:h-28 transition-all duration-700 animate-pulse-slow"
                        style={{
                            stroke: `url(#${id})`,
                            filter: `drop-shadow(0 0 20px ${colors[0]}44)`
                        }}
                    />

                    <svg width="0" height="0" className="absolute">
                        <defs>
                            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: colors[0], stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: colors[1], stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default AnimatedCategoryIcon;
