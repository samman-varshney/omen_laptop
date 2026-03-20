"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import StoryBeats from "./StoryBeats";

const TOTAL_FRAMES = 480;
const FOLDER_1_FRAMES = 240;

const getFramePath = (index: number) => {
  if (index <= FOLDER_1_FRAMES) {
    const frameNumber = index.toString().padStart(3, "0");
    return `/explosion-laptop.88e739b7499c9883-jpg/ezgif-frame-${frameNumber}.jpg`;
  } else {
    // Offset for folder 2
    const frameNumber = (index - FOLDER_1_FRAMES).toString().padStart(3, "0");
    return `/laptop-explosion.8dabd0bfcc81c6e0-jpg/ezgif-frame-${frameNumber}.jpg`;
  }
};

export default function Scrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedFrames, setLoadedFrames] = useState(0);

  // Preload frames safely so canvas immediately draws with no flickering
  useEffect(() => {
    let loaded = 0;
    const imgArray: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loaded++;
        setLoadedFrames(loaded);
      };
      imgArray.push(img);
    }
    setImages(imgArray);
  }, []);

  // Frame mapping smoothly matching the entire sequence duration
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, TOTAL_FRAMES - 1]);

  // Direct canvas render logic outside of React's state loop for performance
  useEffect(() => {
    const renderFrame = (index: number) => {
      // images are 0-indexed in the array, but frame numbers are 1-indexed initially logic
      const img = images[index - 1]; 
      if (!img || !canvasRef.current || !img.complete || img.naturalHeight === 0) return;
      const ctx = canvasRef.current.getContext("2d", { alpha: false });
      if (!ctx) return;

      const canvas = canvasRef.current;

      // Ensure the image sequence gracefully fits while matching Apple scrollytelling style
      // We'll use aspect ratio cover/contain hybrid to keep the laptop dominant
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      // Re-fill background to match the #050505 requested edge-to-edge
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    const unsubscribe = frameIndex.on("change", (latest) => {
      renderFrame(Math.round(latest));
    });

    // Handle high-DPI resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
        renderFrame(Math.round(frameIndex.get()));
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial setup

    // When images actually finish loading, fire a render so the first frame appears instantly
    if (loadedFrames > 0 && loadedFrames <= TOTAL_FRAMES) {
      renderFrame(Math.round(frameIndex.get()));
    }

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [images, frameIndex, loadedFrames]);

  return (
    <div ref={containerRef} className="relative h-[800vh] bg-background">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Loading Overlay */}
        {loadedFrames < TOTAL_FRAMES && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/90 backdrop-blur-md transition-opacity duration-500">
            <span className="text-white/60 text-sm tracking-widest uppercase mb-4 font-semibold">
              Initializing Engine
            </span>
            <div className="w-64 h-[2px] bg-[#111] overflow-hidden rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-[#CC0022] to-[#FF3C00] transition-all duration-300 ease-out" 
                style={{ width: `${(loadedFrames / TOTAL_FRAMES) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Soft radial glow behind the canvas to simulate premium RGB/lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(204,0,34,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />

        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover z-0" 
          style={{ width: "100vw", height: "100vh" }}
        />
        
        {/* Typographic Story Beats floating over canvas */}
        <StoryBeats scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}
