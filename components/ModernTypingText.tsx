import { useEffect, useState } from 'react';

interface ModernTypingTextProps {
    text: string;
    className?: string;
    cursor?: boolean;
    delay?: number;
    speed?: number;
    onComplete?: () => void;
}

export const ModernTypingText = ({
    text,
    className = "",
    cursor = true,
    delay = 0,
    speed = 50,
    deleteSpeed = 30,
    pause = 2000,
    loop = true,
    onComplete
}: ModernTypingTextProps & { deleteSpeed?: number; pause?: number; loop?: boolean }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimeout = setTimeout(() => {
            setStarted(true);
        }, delay);
        return () => clearTimeout(startTimeout);
    }, [delay]);

    useEffect(() => {
        if (!started) return;

        let timer: ReturnType<typeof setTimeout>;

        const handleTyping = () => {
            const currentLength = displayedText.length;

            if (!isDeleting) {
                // Typing
                if (currentLength < text.length) {
                    setDisplayedText(text.slice(0, currentLength + 1));
                    timer = setTimeout(handleTyping, speed + Math.random() * 20); // Add variance for realism
                } else {
                    // Finished typing
                    if (loop) {
                        timer = setTimeout(() => setIsDeleting(true), pause);
                    } else if (onComplete) {
                        onComplete();
                    }
                }
            } else {
                // Deleting
                if (currentLength > 0) {
                    setDisplayedText(text.slice(0, currentLength - 1));
                    timer = setTimeout(handleTyping, deleteSpeed);
                } else {
                    // Finished deleting
                    setIsDeleting(false);
                    timer = setTimeout(handleTyping, 500); // Pause before re-typing
                }
            }
        };

        timer = setTimeout(handleTyping, 100);
        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, started, text, speed, deleteSpeed, pause, loop, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {cursor && <span className="animate-pulse text-saffron">|</span>}
        </span>
    );
};
