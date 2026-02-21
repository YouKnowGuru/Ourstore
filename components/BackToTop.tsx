import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-20 md:bottom-8 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-saffron to-saffron-600 text-white shadow-2xl hover:shadow-glow-lg transform hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-bounce-in"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5 group-hover:animate-pulse" />
                </button>
            )}
        </>
    );
}
