"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { scrollY } = useScroll();
  
  // Navbar starts nearly transparent and becomes a translucent glassmorphism header as you scroll
  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.75)"]
  );

  const navBackdropBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );

  return (
    <motion.header
      style={{
        backgroundColor: navBackground,
        backdropFilter: navBackdropBlur,
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-white font-semibold text-lg tracking-wide group-hover:text-white/90 transition-colors">
            OMEN
          </span>
          <div className="w-[6px] h-[6px] rounded-full bg-[#CC0022] group-hover:shadow-[0_0_8px_#CC0022] transition-shadow" />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          {[
            "Overview",
            "Performance",
            "Cooling",
            "Display",
            "Specs",
          ].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-[19px] left-0 w-full h-[1px] bg-[#CC0022] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </Link>
          ))}
        </nav>

        {/* Right: CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="#buy"
            className={cn(
              "relative group px-4 py-1.5 rounded-full text-sm font-medium text-white",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-[#CC0022] before:to-[#FF3C00] before:p-[1px] before:-z-10",
              "after:absolute after:inset-[1px] after:rounded-full after:bg-[#050505] after:-z-10 group-hover:after:bg-[#0A0A0C] transition-colors"
            )}
          >
            <span className="relative z-10 drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,60,0,0.5)] transition-all">
              Experience Omen
            </span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
