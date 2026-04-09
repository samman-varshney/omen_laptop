'use client';

import { useState, useEffect } from 'react';

// Tracks the current window inner width and updates on resize
export function useWindowWidth(): number {
    const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}
