import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { clsx } from 'clsx';

export type Direction = 'left' | 'right' | 'bottom';

export type FoldProps = {
  index: number;
  messages: string[];
  sequence: Direction[];
  themes: string[];
  smoothProgress: MotionValue<number>;
  total: number;
};

export const Fold: React.FC<FoldProps> = ({
  index,
  messages,
  sequence,
  themes,
  smoothProgress,
  total,
}) => {
  const isBase = index === 0;
  const message = messages[index];
  const theme = themes[index];
  const direction = isBase ? null : sequence[index - 1];

  // Calculate the specific scroll segment for this fold
  const segment = 1 / (total - 1 || 1);
  const startScroll = (index - 1) * segment;
  const endScroll = index * segment;

  // 3D Rotation Mapping
  const rotateRange = direction === 'right' ? [-180, 0] : [180, 0];
  const rotateVal = useTransform(smoothProgress, [startScroll, endScroll], rotateRange, {
    clamp: true,
  });

  // Dynamic Shadows for Realism
  // 1. Ambient Shadow: Darkens the face as it folds inward
  const ambientShadowOpacity = useTransform(smoothProgress, [startScroll, endScroll], [0.8, 0], { clamp: true });

  // 2. Crease Shadow: A sharp gradient simulating light blocking at the hinge
  const creaseShadowOpacity = useTransform(smoothProgress, [startScroll, endScroll], [1, 0], { clamp: true });

  const originClass =
    direction === 'left' ? 'origin-right' :
      direction === 'right' ? 'origin-left' :
        direction === 'bottom' ? 'origin-top' : '';

  const positionClass =
    direction === 'left' ? 'absolute right-full top-0 w-full h-full' :
      direction === 'right' ? 'absolute left-full top-0 w-full h-full' :
        direction === 'bottom' ? 'absolute top-full left-0 w-full h-full' :
          'relative w-full h-full';

  // Determine the direction of the crease shadow based on the hinge
  const creaseGradientClass =
    direction === 'left' ? 'bg-gradient-to-l from-black/60 to-transparent' :
      direction === 'right' ? 'bg-gradient-to-r from-black/60 to-transparent' :
        'bg-gradient-to-t from-black/60 to-transparent'; // bottom

  const style: React.CSSProperties | any = {
    transformStyle: 'preserve-3d',
    z: isBase ? 0 : 1,
  };

  if (!isBase) {
    if (direction === 'bottom') style.rotateX = rotateVal;
    else style.rotateY = rotateVal;
  }

  const hasChild = index < total - 1;

  return (
    <motion.div className={clsx(positionClass, originClass)} style={style}>

      {/* BACKFACE (The "Outside" of the folded paper) */}
      {!isBase && (
        <div
          className="absolute inset-0 w-full h-full bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: direction === 'bottom' ? 'rotateX(180deg)' : 'rotateY(180deg)',
          }}
        >
          {/* Premium dark cardstock texture */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
        </div>
      )}

      {/* FRONTFACE (The Content) */}
      <div
        className={clsx(
          'absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 border border-white/10 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]',
          theme
        )}
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateX(0deg) rotateY(0deg)',
        }}
      >
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-center leading-tight tracking-tighter drop-shadow-lg z-10">
          {message}
        </h2>

        {/* Ambient Overlay Shadow */}
        {!isBase && (
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none z-20"
            style={{ opacity: ambientShadowOpacity }}
          />
        )}

        {/* Crease Hinge Shadow */}
        {!isBase && (
          <motion.div
            className={clsx('absolute inset-0 pointer-events-none z-30', creaseGradientClass)}
            style={{ opacity: creaseShadowOpacity }}
          />
        )}
      </div>

      {/* RECURSIVE CHILD FOLD */}
      {hasChild && (
        <Fold
          index={index + 1}
          messages={messages}
          sequence={sequence}
          themes={themes}
          smoothProgress={smoothProgress}
          total={total}
        />
      )}
    </motion.div>
  );
};