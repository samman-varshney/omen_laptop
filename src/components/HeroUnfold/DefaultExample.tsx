import { HeroUnfold } from './HeroUnfold';

export default function FullyCustomExample() {
  const copy = [
    "A NEW ERA.",
    "BUILT FOR SPEED.",
    "DESIGNED TO SCALE.",
    "BEYOND LIMITS.",
    "PIXEL PERFECT.",
    "MOTION DRIVEN.",
    "PERFORMANCE FIRST.",
    "START BUILDING."
  ];
  // Eye-catchy, premium dark-mode tech themes
  const defaultThemes = [
    'bg-gradient-to-br from-zinc-900 to-black text-white',
    'bg-gradient-to-br from-violet-600 to-indigo-900 text-white',
    'bg-gradient-to-br from-fuchsia-600 to-purple-900 text-white',
    'bg-gradient-to-br from-rose-500 to-red-900 text-white',
    'bg-gradient-to-br from-orange-500 to-amber-900 text-white',
    'bg-gradient-to-br from-emerald-500 to-teal-900 text-white',
    'bg-gradient-to-br from-cyan-500 to-blue-900 text-white',
    'bg-gradient-to-br from-purple-500 to-pink-900 text-white',
  ];

  return (
    <main className="bg-black min-h-screen">
      <HeroUnfold
        messages={copy}
        themes={defaultThemes}
        animationDuration={500}
      />

      {/* This section automatically appears when the unfold is 100% complete */}
      <section className="h-screen bg-zinc-950 flex flex-col items-center justify-center border-t border-white/10 relative z-10">
        <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          The Journey Continues
        </h1>
        <p className="text-zinc-400 text-lg">
          Scroll back up to watch the reverse physics in action.
        </p>
      </section>
    </main>
  );
}