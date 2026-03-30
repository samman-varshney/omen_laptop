import React, { useRef } from 'react';
import { useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { Fold, Direction } from './Fold';

export type HeroUnfoldProps = {
  messages: string[];
  themes: string[];
  className?: string;
  animationDuration?: number;
};

function getSequence(total: number): Direction[] {
  const seq: Direction[] = [];
  for (let i = 1; i < total; i++) {
    if (i % 2 === 0) seq.push('bottom');
    else seq.push(((i - 1) / 2) % 2 === 0 ? 'left' : 'right');
  }
  return seq;
}

export const HeroUnfold: React.FC<HeroUnfoldProps> = ({
  messages,
  themes,
  className = '',
  animationDuration = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [shouldAdjustScroll, setShouldAdjustScroll] = React.useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const hasCompleted = useRef(false);
  const lockedProgress = useTransform(scrollYProgress, (v) => {
    if (v >= 0.999) hasCompleted.current = true;
    return hasCompleted.current ? 1 : v;
  });

  // Tighter spring for a realistic "snap" locking effect
  const smoothProgress = useSpring(lockedProgress, {
    stiffness: 250,
    damping: 35,
    mass: 0.5,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.999 && !isCompleted) {
      setIsCompleted(true);
      setShouldAdjustScroll(true);
    }
  });

  React.useLayoutEffect(() => {
    if (shouldAdjustScroll && containerRef.current) {
      const html = document.documentElement;
      const originalScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto'; // Force instant scrolling

      // Calculate the exact absolute top of the container in the document
      // This is bulletproof against browser clamping double-dips
      const targetY = window.scrollY + containerRef.current.getBoundingClientRect().top;
      window.scrollTo(0, targetY);

      requestAnimationFrame(() => {
        html.style.scrollBehavior = originalScrollBehavior;
      });

      setShouldAdjustScroll(false);
    }
  }, [shouldAdjustScroll]);

  const total = messages.length;

  const cols = total > 1 ? 2 : 1;
  const rows = total > 2 ? Math.ceil(total / 2) : 1;

  const baseWidth = `${100 / cols}%`;
  const baseHeight = `${100 / rows}%`;
  const sequence = getSequence(total);

  return (
    // The height here strictly dictates the scroll duration. 
    // Once scrolled past, it seamlessly unlocks and flows down the page.
    <div
      ref={containerRef}
      style={{ height: isCompleted ? '100vh' : `${animationDuration}vh` }}
      className={`relative w-full bg-black ${className}`}
    >
      {/* Tighter perspective (1200px) creates a much more pronounced 3D effect */}
      <div
        className={isCompleted ? "relative w-full h-screen overflow-hidden" : "sticky top-0 w-full h-screen overflow-hidden"}
        style={{ perspective: '1200px' }}
      >
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <Fold
            index={0}
            messages={messages}
            sequence={sequence}
            themes={themes}
            smoothProgress={smoothProgress}
            total={total}
          />
        </div>
      </div>
    </div>
  );
};