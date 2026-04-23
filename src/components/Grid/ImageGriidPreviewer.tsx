/**
 * DemoImageGridPreviewer
 * ──────────────────
 * Treats the entire 3×3 grid as a single composite image.
 * A circular magnifying glass follows the cursor, showing a magnified
 * region of wherever it hovers — with perfect pixel continuity across
 * all cell boundaries. No transitions, no cell-switching logic: just
 * a sliding viewport over the composite grid.
 *
 * Core idea:
 *   - The glass has a viewport of (GD/MAG) × (GD/MAG) real grid pixels.
 *   - Every cell image is positioned inside the glass at:
 *       left = (cellGridX − viewOriginX) × MAG
 *       top  = (cellGridY − viewOriginY) × MAG
 *   - The glass's overflow:hidden does all the clipping.
 *   - No React re-renders during animation — RAF writes directly to DOM.
 */

import { useRef, useEffect, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const GAP = 3;     // px gap between grid cells
const GD = 200;   // glass diameter (px)
const MAG = 1.85;  // magnification factor
const STIFF = 0.14;  // spring stiffness
const DAMP = 0.74;  // spring damping

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageGridPreviewerProps {
  /** Exactly 9 image URLs */
  images: string[];
  /** Width of each grid cell (px) */
  width: number;
  /** Height of each grid cell (px) */
  height: number;
  /** Optional magnification override */
  magnification?: number;
  /** Optional glass diameter override (px) */
  glassDiameter?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageGridPreviewer({
  images,
  width,
  height,
  magnification = MAG,
  glassDiameter = GD,
}: ImageGridPreviewerProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);

  // Scaled cell size inside the glass
  const sCW = width * magnification;
  const sCH = height * magnification;

  // Spring state — lives in a ref, mutated in RAF, never triggers re-render
  const spring = useRef({ sx: 0, sy: 0, vx: 0, vy: 0, tx: 0, ty: 0, active: false });

  // Refs to the per-cell divs inside the glass
  const gcRefs = useRef<HTMLDivElement[]>([]);

  const sliced = images.slice(0, 9);

  useEffect(() => {
    const glass = glassRef.current;
    if (!glass) return;

    // Preload
    sliced.forEach(src => { const i = new Image(); i.src = src; });

    // Pre-create 9 absolutely-positioned cell wrappers inside the glass
    gcRefs.current = sliced.map((src, i) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = `position:absolute;overflow:hidden;width:${sCW}px;height:${sCH}px;`;

      const img = document.createElement("img");
      img.src = src;
      img.draggable = false;
      img.style.cssText = `
        position:absolute;top:0;left:0;
        width:${sCW}px;height:${sCH}px;
        object-fit:cover;display:block;pointer-events:none;
      `;
      wrap.appendChild(img);
      glass.insertBefore(wrap, glass.firstChild);
      return wrap;
    });

    let raf = 0;

    function tick() {
      const s = spring.current;
      s.vx = s.vx * DAMP + (s.tx - s.sx) * STIFF;
      s.vy = s.vy * DAMP + (s.ty - s.sy) * STIFF;
      s.sx += s.vx;
      s.sy += s.vy;

      if (s.active && gridRef.current && glass) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const cx = Math.max(glassDiameter / 2 + 6, Math.min(s.sx, vw - glassDiameter / 2 - 6));
        const cy = Math.max(glassDiameter / 2 + 6, Math.min(s.sy, vh - glassDiameter / 2 - 6));

        glass.style.transform = `translate(${cx - glassDiameter / 2}px,${cy - glassDiameter / 2}px)`;

        const rect = gridRef.current.getBoundingClientRect();

        // Cursor in grid-local coords (what the glass is centered on)
        const curGridX = s.sx - rect.left;
        const curGridY = s.sy - rect.top;

        // Viewport origin in unscaled grid coords
        const viewX = curGridX - (glassDiameter / magnification) / 2;
        const viewY = curGridY - (glassDiameter / magnification) / 2;

        gcRefs.current.forEach((wrap, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const cellGridX = col * (width + GAP);
          const cellGridY = row * (height + GAP);
          wrap.style.left = ((cellGridX - viewX) * magnification) + "px";
          wrap.style.top = ((cellGridY - viewY) * magnification) + "px";
        });
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      gcRefs.current.forEach(w => w.remove());
      gcRefs.current = [];
    };
  }, [sliced, sCW, sCH, width, height, magnification, glassDiameter]);

  const onEnter = useCallback((e: React.MouseEvent) => {
    const s = spring.current;
    s.sx = e.clientX; s.sy = e.clientY;
    s.vx = 0; s.vy = 0;
    s.tx = e.clientX; s.ty = e.clientY;
    s.active = true;
    if (glassRef.current) glassRef.current.style.opacity = "1";
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    spring.current.tx = e.clientX;
    spring.current.ty = e.clientY;
  }, []);

  const onLeave = useCallback(() => {
    spring.current.active = false;
    if (glassRef.current) glassRef.current.style.opacity = "0";
  }, []);

  return (
    <>
      {/* Grid */}
      <div
        ref={gridRef}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, ${width}px)`,
          gridTemplateRows: `repeat(3, ${height}px)`,
          gap: `${GAP}px`,
          cursor: "none",
          userSelect: "none",
        }}
      >
        {sliced.map((src, i) => (
          <div key={i} style={{ width, height, overflow: "hidden", borderRadius: 2 }}>
            <img
              src={src}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
            />
          </div>
        ))}
      </div>

      {/* Magnifying glass — positioned via RAF, never re-rendered */}
      <div
        ref={glassRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: glassDiameter,
          height: glassDiameter,
          borderRadius: "50%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          willChange: "transform",
          transition: "opacity 0.18s ease",
          outline: "1.5px solid rgba(255,255,255,0.22)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.6), 0 14px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
          backgroundColor: "#0f0f0f",
        }}
      >
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%", zIndex: 1,
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.2) 100%)",
          pointerEvents: "none",
        }} />
        {/* Crosshair */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 2, pointerEvents: "none",
          width: 1, height: 18,
          background: "rgba(255,255,255,0.28)",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 2, pointerEvents: "none",
          width: 18, height: 1,
          background: "rgba(255,255,255,0.28)",
        }} />
      </div>
    </>
  );
}

// ─── Usage example ─────────────────────────────────────────────────────────────

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
  "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=600&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
];

export default function DemoImageGridPreviewer() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
      <ImageGridPreviewer
        images={DEMO_IMAGES}
        width={260}
        height={180}
        magnification={1.85}
        glassDiameter={200}
      />
    </div>
  );
}
