"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
  AnimatePresence,
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */
export type Edge = "top" | "bottom" | "left" | "right";

type NavItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
};

type NavbarProps = {
  items: NavItem[];
  initialPosition?: Edge;
  offset?: number;
  diameter?: number;
  blurIntensity?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
};

/* ═══════════════════════════════════════════════════════════
   Geometry helpers
   ═══════════════════════════════════════════════════════════ */
const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(Math.max(v, lo), hi);

/**
 * Project (mx,my) onto the nearest viewport perimeter point,
 * keeping the navbar fully inside the screen.
 */
function projectToPerimeter(
  mx: number,
  my: number,
  vw: number,
  vh: number,
  nw: number,
  nh: number,
  edgeOff: number,
): { edge: Edge; cx: number; cy: number; dist: number } {
  const PAD = 6;
  const hMin = nw / 2 + PAD,
    hMax = vw - nw / 2 - PAD;
  const vMin = nh / 2 + PAD,
    vMax = vh - nh / 2 - PAD;

  const candidates = [
    { edge: "top", cx: clamp(mx, hMin, hMax), cy: edgeOff + nh / 2, dist: my },
    {
      edge: "bottom",
      cx: clamp(mx, hMin, hMax),
      cy: vh - edgeOff - nh / 2,
      dist: vh - my,
    },
    { edge: "left", cx: edgeOff + nw / 2, cy: clamp(my, vMin, vMax), dist: mx },
    {
      edge: "right",
      cx: vw - edgeOff - nw / 2,
      cy: clamp(my, vMin, vMax),
      dist: vw - mx,
    },
  ];
  return candidates.reduce((a, b) => (a.dist < b.dist ? a : b)) as {
    edge: Edge;
    cx: number;
    cy: number;
    dist: number;
  };
}

/** Get the center point for a navbar centered on a given edge. */
interface EdgeCenterMap {
  top: [number, number];
  bottom: [number, number];
  left: [number, number];
  right: [number, number];
}

function edgeCenter(
  edge: Edge,
  vw: number,
  vh: number,
  nw: number,
  nh: number,
  off: number,
): [number, number] {
  const map: EdgeCenterMap = {
    top: [vw / 2, off + nh / 2],
    bottom: [vw / 2, vh - off - nh / 2],
    left: [off + nw / 2, vh / 2],
    right: [vw - off - nw / 2, vh / 2],
  };
  return map[edge] ?? [vw / 2, off + nh / 2];
}

/** Compute navbar dimensions from orientation, item count, and diameter. */
function computeNavSize(
  edge: Edge,
  n: number,
  d: number,
): { w: number; h: number; gap: number; pad: number } {
  const isV = edge === "left" || edge === "right";
  const gap = Math.round(d * 0.2);
  const pad = Math.round(d * 0.32);
  return {
    w: isV ? d + pad * 2 : n * d + (n - 1) * gap + pad * 2,
    h: isV ? n * d + (n - 1) * gap + pad * 2 : d + pad * 2,
    gap,
    pad,
  };
}

/* ═══════════════════════════════════════════════════════════
   useEdgeDrag.ts  (inlined)
   ═══════════════════════════════════════════════════════════ */
function useEdgeDrag(
  initialEdge: Edge,
  offset: number,
  navSizeRef: React.MutableRefObject<{ w: number; h: number }>,
) {
  const [edge, setEdge] = useState(initialEdge);
  const [isDragging, setIsDragging] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  /* Spring-driven center position */
  const SPRING = { stiffness: 330, damping: 32, mass: 0.65 };
  const ns0 = navSizeRef.current;

  const initialVw = isHydrated ? window.innerWidth : 1024;
  const initialVh = isHydrated ? window.innerHeight : 768;

  const [icx, icy] = edgeCenter(
    initialEdge,
    initialVw,
    initialVh,
    ns0.w,
    ns0.h,
    offset,
  );

  const cxSpring = useSpring(icx, SPRING);
  const cySpring = useSpring(icy, SPRING);

  /* Top-left corner motion values (derived from center) */
  const x = useMotionValue(icx - ns0.w / 2);
  const y = useMotionValue(icy - ns0.h / 2);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const [cx, cy] = edgeCenter(
      edge,
      window.innerWidth,
      window.innerHeight,
      navSizeRef.current.w,
      navSizeRef.current.h,
      offset,
    );
    cxSpring.set(cx);
    cySpring.set(cy);
  }, [isHydrated, edge, offset, navSizeRef, cxSpring, cySpring]);

  /* Sync x/y from center springs whenever springs change */
  useEffect(() => {
    const unsub1 = cxSpring.on("change", (v) =>
      x.set(v - navSizeRef.current.w / 2),
    );
    const unsub2 = cySpring.on("change", (v) =>
      y.set(v - navSizeRef.current.h / 2),
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [cxSpring, cySpring, x, y, navSizeRef]);

  /* Recenter x/y when navSize changes (edge flip) */
  useEffect(() => {
    x.set(cxSpring.get() - navSizeRef.current.w / 2);
    y.set(cySpring.get() - navSizeRef.current.h / 2);
  }, [edge]); // eslint-disable-line

  /* Velocity tracking for inertia */
  const isDown = useRef(false);
  const curEdge = useRef(initialEdge);
  const velRef = useRef({ x: 0, y: 0, px: 0, py: 0, t: 0 });

  const onPointerMove = useCallback(
    (e: Event) => {
      if (!isDown.current) return;
      const mouseEvent = e as MouseEvent;
      const touchEvent = e as TouchEvent;
      const mx =
        "touches" in e ? touchEvent.touches[0]?.clientX : mouseEvent.clientX;
      const my =
        "touches" in e ? touchEvent.touches[0]?.clientY : mouseEvent.clientY;
      if (mx === undefined || my === undefined) return;
      const ns = navSizeRef.current;
      const proj = projectToPerimeter(
        mx,
        my,
        window.innerWidth,
        window.innerHeight,
        ns.w,
        ns.h,
        offset,
      );

      cxSpring.set(proj.cx);
      cySpring.set(proj.cy);
      curEdge.current = proj.edge;
      setEdge(proj.edge);

      const now = performance.now();
      const dt = now - velRef.current.t || 1;
      velRef.current = {
        x: ((mx - velRef.current.px) / dt) * 16,
        y: ((my - velRef.current.py) / dt) * 16,
        px: mx,
        py: my,
        t: now,
      };
    },
    [cxSpring, cySpring, offset, navSizeRef],
  );

  const onPointerUp = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    setIsDragging(false);

    /* Inertia: glide along the current edge then settle */
    const v = velRef.current;
    const ns = navSizeRef.current;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    const e = curEdge.current;
    const IF = 2.8; // inertia factor

    if (e === "top" || e === "bottom") {
      const tx = clamp(
        cxSpring.get() + v.x * IF,
        ns.w / 2 + 8,
        vw - ns.w / 2 - 8,
      );
      animate(cxSpring, tx, {
        type: "spring",
        stiffness: 110,
        damping: 22,
        velocity: v.x,
      });
    } else {
      const ty = clamp(
        cySpring.get() + v.y * IF,
        ns.h / 2 + 8,
        vh - ns.h / 2 - 8,
      );
      animate(cySpring, ty, {
        type: "spring",
        stiffness: 110,
        damping: 22,
        velocity: v.y,
      });
    }
  }, [cxSpring, cySpring, navSizeRef]);

  const startDrag = useCallback((mx: number, my: number) => {
    isDown.current = true;
    setIsDragging(true);
    velRef.current = { x: 0, y: 0, px: mx, py: my, t: performance.now() };
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    },
    [startDrag],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      startDrag(touch.clientX, touch.clientY);
    },
    [startDrag],
  );

  /* Global listeners */
  useEffect(() => {
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    const onResize = () => {
      const ns = navSizeRef.current;
      const proj = projectToPerimeter(
        cxSpring.get(),
        cySpring.get(),
        window.innerWidth,
        window.innerHeight,
        ns.w,
        ns.h,
        offset,
      );
      cxSpring.set(proj.cx);
      cySpring.set(proj.cy);
      setEdge(proj.edge);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [onPointerMove, onPointerUp, cxSpring, cySpring, offset, navSizeRef]);

  return { x, y, edge, isDragging, onMouseDown, onTouchStart };
}

/* ═══════════════════════════════════════════════════════════
   useAutoHide
   ═══════════════════════════════════════════════════════════ */
function useAutoHide(delay: number, enabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (!enabled) return;
    setHidden(false);
    clearTimer();
    timer.current = window.setTimeout(() => setHidden(true), delay);
  }, [delay, enabled, clearTimer]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("mousemove", reset);
    window.addEventListener("touchstart", reset, { passive: true });
    reset();
    return () => {
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("touchstart", reset);
      clearTimer();
    };
  }, [reset, enabled, clearTimer]);

  return { hidden, resetTimer: reset };
}

/* ═══════════════════════════════════════════════════════════
   Tooltip
   ═══════════════════════════════════════════════════════════ */
function Tooltip({ label, edge }: { label: string; edge: Edge }) {
  const placement = {
    top: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
    },
    bottom: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
    },
    left: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)",
    },
    right: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)",
    },
  }[edge];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      style={{
        position: "absolute",
        ...placement,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "rgba(220,230,255,0.85)",
        background: "rgba(6,10,20,0.9)",
        border: "1px solid rgba(100,140,255,0.18)",
        padding: "5px 10px",
        borderRadius: 8,
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        zIndex: 10,
      }}
    >
      {label}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NavItemEl
   ═══════════════════════════════════════════════════════════ */
function NavItemEl({
  item,
  isActive,
  diameter,
  edge,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  diameter: number;
  edge: Edge;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: diameter * 0.28,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 3,
          position: "relative",
          overflow: "hidden",
          background: isActive
            ? "rgba(80, 120, 255, 0.22)"
            : hovered
              ? "rgba(255,255,255,0.09)"
              : "transparent",
          color: isActive ? "rgba(160,190,255,1)" : "rgba(190,200,230,0.8)",
          transition: "background 0.2s ease, color 0.2s ease",
          outline: "none",
          flexShrink: 0,
        }}
        aria-label={item.label}
      >
        {/* Active glow ring */}
        {isActive && (
          <motion.div
            layoutId="activeGlow"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: diameter * 0.28,
              border: "1px solid rgba(100,150,255,0.45)",
              boxShadow:
                "inset 0 0 12px rgba(80,120,255,0.2), 0 0 20px rgba(80,120,255,0.15)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Hover shimmer */}
        {hovered && !isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: diameter * 0.28,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
            }}
          />
        )}

        {/* Icon */}
        <span
          style={{
            width: diameter * 0.42,
            height: diameter * 0.42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.icon}
        </span>

        {/* Label (only if large enough) */}
        {diameter >= 56 && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1,
              opacity: 0.7,
            }}
          >
            {item.label.slice(0, 6)}
          </span>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && <Tooltip label={item.label} edge={edge} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FloatingNavbar.tsx  (inlined)
   ═══════════════════════════════════════════════════════════ */
export function FloatingNavbar({
  items,
  initialPosition = "top",
  offset = 20,
  diameter = 48,
  blurIntensity = 22,
  autoHide = false,
  autoHideDelay = 4000,
}: NavbarProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  /* Compute sizes */
  const navSizeRef = useRef(
    computeNavSize(initialPosition, items.length, diameter),
  );

  const { x, y, edge, isDragging, onMouseDown, onTouchStart } = useEdgeDrag(
    initialPosition,
    offset,
    navSizeRef,
  );
  const { hidden, resetTimer } = useAutoHide(autoHideDelay, autoHide);

  const isVertical = edge === "left" || edge === "right";
  const { w, h, gap, pad } = useMemo(
    () => computeNavSize(edge, items.length, diameter),
    [edge, items.length, diameter],
  );

  /* Keep ref updated every render */
  navSizeRef.current = { w, h, gap, pad };

  /* Container padding */
  const containerStyle = useMemo(
    () =>
      ({
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap,
        padding: isVertical
          ? `${pad}px ${Math.round((w - diameter) / 2)}px`
          : `${Math.round((h - diameter) / 2)}px ${pad}px`,
        width: "100%",
        height: "100%",
      }) as React.CSSProperties,
    [isVertical, gap, pad, w, h, diameter],
  );

  return (
    <motion.nav
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={resetTimer}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x,
        y,
        width: w,
        height: h,
        borderRadius: Math.round(Math.min(w, h) * 0.38),
        zIndex: 9999,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
        /* Glassmorphism */
        background: "rgba(6, 10, 22, 0.62)",
        backdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: [
          "0 8px 40px rgba(0,0,0,0.55)",
          "0 2px 12px rgba(0,0,0,0.4)",
          "0 0 0 1px rgba(80,120,255,0.1)",
          "inset 0 1px 0 rgba(255,255,255,0.09)",
          "inset 0 0 0 1px rgba(255,255,255,0.04)",
        ].join(", "),
        willChange: "transform",
      }}
      animate={{
        opacity: hidden ? 0.12 : 1,
        scale: isDragging ? 1.04 : 1,
      }}
      transition={{
        opacity: { duration: 0.6, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 400, damping: 28 },
        width: { type: "spring", stiffness: 280, damping: 28 },
        height: { type: "spring", stiffness: 280, damping: 28 },
      }}
      layout
    >
      {/* Inner glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(80,120,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Items */}
      <div style={containerStyle}>
        {items.map((item, i) => (
          <NavItemEl
            key={i}
            item={item}
            isActive={activeIdx === i}
            diameter={diameter}
            edge={edge}
            onClick={() => {
              setActiveIdx(i);
              item.onClick?.();
              if (item.href) window.location.href = item.href;
            }}
          />
        ))}
      </div>

      {/* Drag handle indicator */}
      <motion.div
        animate={{ opacity: isDragging ? 0.7 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          border: "1.5px solid rgba(100,150,255,0.45)",
          boxShadow:
            "0 0 24px rgba(80,120,255,0.2), inset 0 0 24px rgba(80,120,255,0.05)",
          pointerEvents: "none",
        }}
      />
    </motion.nav>
  );
}
