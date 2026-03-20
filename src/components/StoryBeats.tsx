"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface StoryBeatsProps {
  scrollYProgress: MotionValue<number>;
}

export default function StoryBeats({ scrollYProgress }: StoryBeatsProps) {
  // Hero / Intro (0–15%)
  const beat1Opacity = useTransform(scrollYProgress, [0, 0.05, 0.12, 0.16], [1, 1, 0, 0]);
  const beat1Y = useTransform(scrollYProgress, [0, 0.12], [0, -50]);

  // Engineering Reveal (15–40%)
  const beat2Opacity = useTransform(scrollYProgress, [0.15, 0.20, 0.35, 0.40], [0, 1, 1, 0]);
  const beat2Y = useTransform(scrollYProgress, [0.15, 0.20], [50, 0]);

  // Circuit Reveal (40–60%)
  const beat3Opacity = useTransform(scrollYProgress, [0.42, 0.48, 0.55, 0.60], [0, 1, 1, 0]);
  const beat3X = useTransform(scrollYProgress, [0.42, 0.48], [50, 0]);

  // Reassembly (60–75%)
  const beat4Opacity = useTransform(scrollYProgress, [0.63, 0.68, 0.72, 0.76], [0, 1, 1, 0]);
  const beat4Y = useTransform(scrollYProgress, [0.63, 0.68], [50, 0]);

  // Hero Lock (75–100%)
  const beat5Opacity = useTransform(scrollYProgress, [0.80, 0.85, 1], [0, 1, 1]);
  const beat5Scale = useTransform(scrollYProgress, [0.80, 0.90], [0.95, 1]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="max-w-7xl mx-auto px-8 w-full h-full relative">
        
        {/* BEAT 1: HERO (Centered) */}
        <motion.div 
          style={{ opacity: beat1Opacity, y: beat1Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center mt-[-20vh]"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#FF4444] drop-shadow-2xl">
            HP OMEN
          </h1>
          <p className="mt-4 text-2xl md:text-3xl font-medium text-white/90 tracking-tight">
            Engineered for dominance.
          </p>
          <p className="mt-2 text-lg text-white/60 max-w-lg mx-auto">
            Flagship gaming performance, re-engineered for a world that demands more.
          </p>
        </motion.div>

        {/* BEAT 2: ENGINEERING (Left Aligned, middle) */}
        <motion.div 
          style={{ opacity: beat2Opacity, y: beat2Y }}
          className="absolute inset-y-0 left-8 flex flex-col justify-center max-w-md"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Precision-engineered <br />
            <span className="text-[#CC0022]">for performance.</span>
          </h2>
          <p className="mt-6 text-xl text-white/70 leading-relaxed font-light">
            Custom thermal architecture, vapor chamber cooling, and optimized airflow deliver sustained peak performance.
          </p>
          <p className="mt-4 text-white/50">
            Every component is tuned for power, stability, and endurance — match after match.
          </p>
        </motion.div>

        {/* BEAT 3: CIRCUIT (Right Aligned, middle) */}
        <motion.div 
          style={{ opacity: beat3Opacity, x: beat3X }}
          className="absolute inset-y-0 right-8 flex flex-col justify-center max-w-md text-right items-end"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-[1px] bg-[#00A8FF]/50" />
            <span className="text-[#00A8FF] font-mono text-sm tracking-widest uppercase">System Architecture</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Inside the machine.
          </h2>
          <ul className="mt-8 space-y-6 text-white/70">
            <li className="flex flex-col gap-1 border-r-2 border-[#CC0022]/30 pr-4">
              <strong className="text-white text-lg">Next-gen GPU</strong>
              <span className="text-sm">Built for ray tracing and beyond.</span>
            </li>
            <li className="flex flex-col gap-1 border-r-2 border-[#CC0022]/30 pr-4">
              <strong className="text-white text-lg">Intelligent thermal management</strong>
              <span className="text-sm">Keeps performance locked at peak.</span>
            </li>
            <li className="flex flex-col gap-1 border-r-2 border-[#CC0022]/30 pr-4">
              <strong className="text-white text-lg">Unrestrained tuning</strong>
              <span className="text-sm">Every layer engineered to push limits.</span>
            </li>
          </ul>
        </motion.div>

        {/* BEAT 4: REASSEMBLY (Left Aligned / Bottom) */}
        <motion.div 
          style={{ opacity: beat4Opacity, y: beat4Y }}
          className="absolute bottom-32 left-8 max-w-lg"
        >
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Built to last. <br />
            Tuned to win.
          </h2>
          <div className="mt-6 p-6 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm">
            <p className="text-white/80 leading-relaxed">
              Military-grade durability meets gaming-grade precision in every chassis detail. Engineered not just to perform — but to endure every session, every environment.
            </p>
          </div>
        </motion.div>

        {/* BEAT 5: HERO LOCK (Centered / Bottom) */}
        <motion.div 
          style={{ opacity: beat5Opacity, scale: beat5Scale }}
          className="absolute bottom-24 left-0 right-0 flex flex-col items-center text-center pointer-events-auto"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,0,34,0.15)_0%,transparent_50%)] pointer-events-none blur-2xl" />
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter drop-shadow-xl z-10">
            Dominate everything. <br/>
            Compromise nothing.
          </h2>
          <p className="mt-4 text-xl text-[#FF3C00] font-medium tracking-wide z-10">
            HP Omen. Designed for victory, built for every battle.
          </p>
          
          <div className="mt-10 flex items-center gap-6 z-10">
            <button className="relative group px-8 py-4 rounded-full bg-[#CC0022] hover:bg-[#FF3C00] transition-colors overflow-hidden">
              <span className="relative z-10 text-white font-semibold text-lg drop-shadow-md tracking-wide">
                Experience Omen
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <a href="#" className="text-white/60 hover:text-white transition-colors font-medium relative group">
              See full specs
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-white/30 group-hover:bg-white transition-colors" />
            </a>
          </div>
          <p className="mt-8 text-xs text-white/40 uppercase tracking-widest z-10">
            Engineered for esports arenas, studios, and everywhere in between.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
