import { useEffect, useRef, useState } from 'react';

/**
 * Hook per animare elementi quando entrano nel viewport
 * Usa Intersection Observer per performance ottimali
 */
export function useScrollAnimation<T extends HTMLElement>(
    options: IntersectionObserverInit = {}
): [React.RefObject<T | null>, boolean] {
    const elementRef = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        return false;
    });

    useEffect(() => {
        const element = elementRef.current;
        if (!element || isVisible) return; // If already visible (reduced motion), skip observer

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        // Once visible, stop observing
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [options, isVisible]);

    return [elementRef, isVisible];
}

/**
 * Hook per animare multipli elementi con stagger
 */
export function useStaggerAnimation(
    itemCount: number,
    baseDelay: number = 100
): boolean[] {
    const [visibleItems, setVisibleItems] = useState<boolean[]>(
        new Array(itemCount).fill(false)
    );

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        for (let i = 0; i < itemCount; i++) {
            const timer = setTimeout(() => {
                setVisibleItems((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                });
            }, i * baseDelay);
            timers.push(timer);
        }

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [itemCount, baseDelay]);

    return visibleItems;
}

/**
 * Hook per parallax effect
 * Disabilitato su mobile per performance ottimali
 */
export function useParallax(speed: number = 0.5): number {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        // Disable parallax on mobile devices for better scroll performance
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isMobile || prefersReducedMotion) {
            return;
        }

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    // Limit parallax to hero area (first 400px of scroll)
                    if (scrollY < 400) {
                        setOffset(scrollY * speed);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
}

/**
 * Hook per header opacity on scroll
 */
export function useScrollOpacity(): number {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Full opacity after 100px of scroll
            const newOpacity = Math.min(scrollY / 100, 1);
            setOpacity(newOpacity);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return opacity;
}
