"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Testimonial, CircleNode, FloatingTestimonialsProps } from './types';
import styles from './FloatingTestimonials.module.css';

const DEFAULT_DATA: Testimonial[] = [
  { name: "Sarah Chen", role: "CTO · Nexus Labs", initials: "SC", g: ["#7C3AED", "#4F46E5"], img: "https://i.pravatar.cc/80?img=1", quote: "Completely transformed our product workflow. Worth every single penny.", r: 5 },
  { name: "Marcus Webb", role: "Founder · Elevate", initials: "MW", g: ["#DB2777", "#F43F5E"], img: "https://i.pravatar.cc/80?img=3", quote: "The smoothest onboarding I've ever seen. Our entire team absolutely loves it.", r: 5 },
  { name: "Priya Sharma", role: "Head of Design · Orion", initials: "PS", g: ["#0EA5E9", "#06B6D4"], img: "https://i.pravatar.cc/80?img=5", quote: "Finally a tool that steps aside and lets us focus on building great things.", r: 5 },
  { name: "David Laurent", role: "VP Eng · Meridian", initials: "DL", g: ["#10B981", "#34D399"], img: "https://i.pravatar.cc/80?img=8", quote: "Cut our delivery time in half. ROI was immediate and completely undeniable.", r: 5 },
  { name: "Yuki Tanaka", role: "Product Lead · Arc", initials: "YT", g: ["#F59E0B", "#FBBF24"], img: "https://i.pravatar.cc/80?img=9", quote: "I recommend this to every founder I know. It's simply exceptional quality.", r: 5 },
  { name: "Alex Rivera", role: "CEO · Luminary", initials: "AR", g: ["#8B5CF6", "#EC4899"], img: "https://i.pravatar.cc/80?img=12", quote: "The quality and polish here is what we aspire to in our own products.", r: 5 },
  { name: "Emma Walsh", role: "Dir. Marketing · Pulse", initials: "EW", g: ["#F97316", "#EF4444"], img: "https://i.pravatar.cc/80?img=20", quote: "Conversion rate jumped 40% after switching. Truly remarkable results.", r: 5 },
  { name: "Raj Patel", role: "Architect · Vertex", initials: "RP", g: ["#6366F1", "#8B5CF6"], img: "https://i.pravatar.cc/15?img=15", quote: "Best investment our engineering team has made this year. No contest.", r: 5 },
  { name: "Nina Koch", role: "CPO · Strata", initials: "NK", g: ["#EF4444", "#F97316"], img: "https://i.pravatar.cc/80?img=25", quote: "Elegant, fast, reliable. Exactly what modern product teams deserve.", r: 5 },
  { name: "James Okafor", role: "Founder · Beacon", initials: "JO", g: ["#14B8A6", "#0EA5E9"], img: "https://i.pravatar.cc/80?img=33", quote: "Shipped our MVP 3 weeks early because of this. Our investors noticed.", r: 5 },
  { name: "Lisa Park", role: "UX Lead · Nova", initials: "LP", g: ["#A78BFA", "#93C5FD"], img: "https://i.pravatar.cc/80?img=47", quote: "The micro-interactions alone are worth it. Our users are absolutely delighted.", r: 5 },
  { name: "Tom Brennan", role: "CTO · Cascade", initials: "TB", g: ["#F59E0B", "#F97316"], img: "https://i.pravatar.cc/80?img=52", quote: "I've tried every alternative. Nothing comes close to this level of craft.", r: 5 },
];

const FloatingTestimonials: React.FC<FloatingTestimonialsProps> = ({
  data = DEFAULT_DATA,
  speed = 1.0,
  randomness = 1.0,
  spacing = 20,
  circleSize = 70,
  collision = true,
  hasChildren = true,
  wrapAround = false,
  bgColor = '#06070f',
  children
}) => {
  const DATA = data;
  const cfg = useRef({ speed, randomness, spacing, circleSize, collision, hasChildren, wrapAround, bgColor });

  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tipAvRef = useRef<HTMLDivElement>(null);
  const tipNameRef = useRef<HTMLDivElement>(null);
  const tipRoleRef = useRef<HTMLDivElement>(null);
  const tipQuoteRef = useRef<HTMLDivElement>(null);
  const tipStarsRef = useRef<HTMLDivElement>(null);

  const getScene = () => sceneRef.current;
  const getCanvas = () => canvasRef.current;
  const getCtx = () => canvasRef.current?.getContext('2d');
  const getHero = () => heroRef.current;
  const getTooltip = () => tooltipRef.current;

  const circlesRef = useRef<CircleNode[]>([]);
  const W = useRef(0);
  const H = useRef(0);

  function resizeCanvas() {
    const canvas = getCanvas();
    if (canvas) {
      canvas.width = W.current;
      canvas.height = H.current;
    }
  }

  useEffect(() => {
    cfg.current = { speed, randomness, spacing, circleSize, collision, hasChildren, wrapAround, bgColor };

    document.documentElement.style.setProperty('--bg', bgColor);
    const scene = getScene();
    if (scene) {
      scene.style.background = bgColor;
      scene.style.overflow = wrapAround ? 'visible' : 'hidden';
    }

    const r = parseInt(bgColor.replace('#', '').slice(0, 2), 16) || 6;
    const g = parseInt(bgColor.replace('#', '').slice(2, 4), 16) || 7;
    const b = parseInt(bgColor.replace('#', '').slice(4, 6), 16) || 15;
    document.documentElement.style.setProperty('--glass', `rgba(${r},${g},${b},0.84)`);

    circlesRef.current.forEach(c => {
      c.size = circleSize;
      c.r = circleSize / 2;
      if (c.el) {
        c.el.style.width = circleSize + 'px';
        c.el.style.height = circleSize + 'px';
        c.el.style.marginLeft = -circleSize / 2 + 'px';
        c.el.style.marginTop = -circleSize / 2 + 'px';
        const body = c.el.querySelector(`.${styles['avatar-body']}`) as HTMLElement;
        if (body) body.style.fontSize = Math.round(circleSize * .24) + 'px';
      }
    });

    const hero = getHero();
    if (hero) {
      if (hasChildren) {
        hero.classList.remove(styles.hidden);
        gsap.to(hero, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' });
      } else {
        gsap.to(hero, { opacity: 0, scale: 0.92, duration: 0.35, ease: 'power2.in', onComplete: () => hero.classList.add(styles.hidden) });
      }
    }
  }, [speed, randomness, spacing, circleSize, collision, hasChildren, wrapAround, bgColor]);

  function showTip(circle: CircleNode) {
    const d = circle.data;
    if (tipNameRef.current) tipNameRef.current.textContent = d.name;
    if (tipRoleRef.current) tipRoleRef.current.textContent = d.role;
    if (tipQuoteRef.current) tipQuoteRef.current.textContent = d.quote;
    if (tipStarsRef.current) tipStarsRef.current.innerHTML = Array(d.r).fill(`<span class="${styles.star}">★</span>`).join('');
    const av = tipAvRef.current;
    if (av) {
      av.style.background = `linear-gradient(135deg,${d.g[0]},${d.g[1]})`;
      av.innerHTML = `<img src="${d.img}" alt="${d.name}" onerror="this.style.display='none'">`;
    }
    posTip(circle);
    gsap.killTweensOf(getTooltip());
    gsap.to(getTooltip(), { opacity: 1, scale: 1, y: 0, duration: .38, ease: 'expo.out' });
  }

  function hideTip() {
    gsap.killTweensOf(getTooltip());
    gsap.to(getTooltip(), { opacity: 0, scale: .94, y: 10, duration: .22, ease: 'power2.in' });
  }

  function posTip(circle: CircleNode) {
    const tooltip = getTooltip();
    const scene = getScene();
    if (!tooltip || !scene) return;

    const TW = 248, TH = 155;
    const rect = scene.getBoundingClientRect();
    let tx = rect.left + circle.x - TW / 2;
    let ty = rect.top + circle.y - circle.r - TH - 12;

    tx = Math.max(8, Math.min(window.innerWidth - TW - 8, tx));
    if (ty < 8) ty = rect.top + circle.y + circle.r + 10;
    ty = Math.max(8, Math.min(window.innerHeight - TH - 8, ty));

    gsap.set(tooltip, { left: tx, top: ty });
  }

  class Circle implements CircleNode {
    data: Testimonial;
    index: number;
    size: number;
    r: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    paused: boolean;
    hovered: boolean;
    el: HTMLDivElement | null;

    constructor(data: Testimonial, index: number) {
      this.data = data;
      this.index = index;
      this.size = cfg.current.circleSize;
      this.r = this.size / 2;
      this.paused = false;
      this.hovered = false;
      this.el = null;

      const angle = (index / DATA.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const spread = Math.min(W.current, H.current) * (0.25 + Math.random() * 0.2);
      this.x = W.current / 2 + Math.cos(angle) * spread;
      this.y = H.current / 2 + Math.sin(angle) * spread;

      const spd = (0.2 + Math.random() * 0.25) * cfg.current.speed;
      const vAng = Math.random() * Math.PI * 2;
      this.vx = Math.cos(vAng) * spd;
      this.vy = Math.sin(vAng) * spd;
    }

    buildDOM() {
      const el = document.createElement('div');
      el.className = styles['avatar-wrap'];
      const [c1, c2] = this.data.g;

      el.style.cssText = `width:${this.size}px;height:${this.size}px;margin-left:-${this.r}px;margin-top:-${this.r}px;`;
      el.innerHTML = `
      <div class="${styles['avatar-glow']}" style="background:radial-gradient(circle,${c1}80,transparent 70%)"></div>
      <div class="${styles['avatar-body']}" style="font-size:${Math.round(this.size * .24)}px;background:linear-gradient(135deg,${c1},${c2})">
        <img src="${this.data.img}" alt="${this.data.name}" onerror="this.style.display='none'">
        <span class="${styles['avatar-initials']}">${this.data.initials}</span>
      </div>
      <div class="${styles['avatar-ring']}"></div>`;

      this.el = el;
      gsap.set(el, { x: this.x, y: this.y });

      let intentTimer: ReturnType<typeof setTimeout> | null = null;
      el.addEventListener('mouseenter', () => {
        intentTimer = setTimeout(() => {
          this.paused = true; this.hovered = true;
          gsap.to(el, { scale: 1.18, duration: 0.45, ease: 'back.out(2)' });
          showTip(this);
        }, 80);
      });
      el.addEventListener('mouseleave', () => {
        if (intentTimer) clearTimeout(intentTimer);
        this.paused = false; this.hovered = false;
        gsap.to(el, { scale: 1, duration: 0.4, ease: 'expo.out' });
        hideTip();
      });

      return el;
    }

    update(siblings: CircleNode[]) {
      if (this.paused) {
        this.vx *= 0.82; this.vy *= 0.82;
        this.x += this.vx; this.y += this.vy;
        if (this.el) gsap.set(this.el, { x: this.x, y: this.y });
        return;
      }

      this.vx += (Math.random() - .5) * 0.038 * cfg.current.randomness;
      this.vy += (Math.random() - .5) * 0.038 * cfg.current.randomness;

      const maxSpd = 0.8 * cfg.current.speed;
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > maxSpd) { this.vx = this.vx / spd * maxSpd; this.vy = this.vy / spd * maxSpd; }

      this.vx *= 0.993; this.vy *= 0.993;

      if (cfg.current.wrapAround) {
        const pad = this.r + 2;
        if (this.x < -pad) this.x = W.current + pad;
        if (this.x > W.current + pad) this.x = -pad;
        if (this.y < -pad) this.y = H.current + pad;
        if (this.y > H.current + pad) this.y = -pad;
      } else {
        const m = this.r + 28, wall = 0.11;
        if (this.x < m) this.vx += wall * (1 - this.x / m);
        if (this.x > W.current - m) this.vx -= wall * (1 - (W.current - this.x) / m);
        if (this.y < m) this.vy += wall * (1 - this.y / m);
        if (this.y > H.current - m) this.vy -= wall * (1 - (H.current - this.y) / m);
      }

      if (cfg.current.hasChildren) {
        const cvR = 155;
        const cdx = this.x - W.current / 2, cdy = this.y - H.current / 2;
        const cd = Math.hypot(cdx, cdy);
        if (cd < cvR + this.r && cd > .1) {
          const f = 0.14 * ((cvR + this.r - cd) / cvR);
          this.vx += (cdx / cd) * f; this.vy += (cdy / cd) * f;
        }
      }

      if (cfg.current.collision) {
        for (const o of siblings) {
          if (o === this) continue;
          const dx = this.x - o.x, dy = this.y - o.y;
          const d = Math.hypot(dx, dy);
          const mn = this.r + o.r + cfg.current.spacing;
          if (d < mn && d > .1) {
            const f = ((mn - d) / mn) * 0.28;
            this.vx += (dx / d) * f; this.vy += (dy / d) * f;
          }
        }
      }

      this.x += this.vx; this.y += this.vy;
      if (this.el) gsap.set(this.el, { x: this.x, y: this.y });
    }
  }

  useEffect(() => {
    const scene = getScene();
    if (!scene) return;

    W.current = scene.offsetWidth;
    H.current = scene.offsetHeight;
    resizeCanvas();

    circlesRef.current = DATA.map((d, i) => {
      const c = new Circle(d, i);
      const el = c.buildDOM!();
      scene.appendChild(el);
      return c;
    });

    circlesRef.current.forEach((c, i) => {
      if (!c.el) return;
      gsap.from(c.el, { scale: 0, opacity: 0, duration: 0.9, delay: 0.4 + i * .07, ease: 'back.out(1.6)' });
    });

    const heroEls = scene.querySelectorAll(`.${styles['hero-eyebrow']}, .${styles['hero-title']}, .${styles['hero-sub']}, .${styles['hero-badge']}`);
    heroEls.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, delay: 0.2 + i * .14, ease: 'expo.out',
        onStart() { gsap.set(el, { y: 20 }); }
      });
    });

    const tickHandler = () => {
      const circles = circlesRef.current;
      circles.forEach(c => c.update?.(circles));
      drawLines();
      const hov = circles.find(c => c.hovered);
      if (hov && parseFloat(gsap.getProperty(getTooltip() as Element, 'opacity') as string) > .4) posTip(hov);
    };

    gsap.ticker.fps(60);
    gsap.ticker.add(tickHandler);

    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        W.current = e.contentRect.width;
        H.current = e.contentRect.height;
        resizeCanvas();
      }
    });
    ro.observe(scene);

    return () => {
      gsap.ticker.remove(tickHandler);
      ro.disconnect();
      // Clean up circles
      circlesRef.current.forEach(c => { if (c.el) c.el.remove(); });
    };
  }, [data]);

  function drawLines() {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, W.current, H.current);

    if (cfg.current.hasChildren) {
      const cx = W.current / 2, cy = H.current / 2;
      circlesRef.current.forEach(c => {
        const dist = Math.hypot(c.x - cx, c.y - cy);
        const alpha = Math.max(0, .12 - dist / (Math.min(W.current, H.current) * 1.4));
        if (alpha < .005) return;
        const grad = ctx.createLinearGradient(cx, cy, c.x, c.y);
        grad.addColorStop(0, `rgba(201,168,76,0)`);
        grad.addColorStop(.5, `rgba(201,168,76,${alpha})`);
        grad.addColorStop(1, `rgba(201,168,76,0)`);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = grad; ctx.lineWidth = .8; ctx.stroke();
      });
    }

    const circles = circlesRef.current;
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const a = circles[i], b = circles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 160) continue;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(201,168,76,${(1 - d / 160) * .065})`; ctx.lineWidth = .6; ctx.stroke();
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.scene} ref={sceneRef}>
        <canvas className={styles.canvasLines} ref={canvasRef}></canvas>
        <div className={`${styles['edge-fade']} ${styles['ef-top']} ${wrapAround ? styles.show : ''}`} style={{ background: `linear-gradient(to bottom, ${bgColor}, transparent)` }}></div>
        <div className={`${styles['edge-fade']} ${styles['ef-bottom']} ${wrapAround ? styles.show : ''}`} style={{ background: `linear-gradient(to top, ${bgColor}, transparent)` }}></div>
        <div className={`${styles['edge-fade']} ${styles['ef-left']} ${wrapAround ? styles.show : ''}`} style={{ background: `linear-gradient(to right, ${bgColor}, transparent)` }}></div>
        <div className={`${styles['edge-fade']} ${styles['ef-right']} ${wrapAround ? styles.show : ''}`} style={{ background: `linear-gradient(to left, ${bgColor}, transparent)` }}></div>
        <div className={styles.hero} ref={heroRef}>
          <div className={styles['hero-eyebrow']}>Social Proof</div>
          <h1 className={styles['hero-title']}>Loved by the<br /><em>world's best</em> teams</h1>
          <p className={styles['hero-sub']}>Join companies transforming how they build and ship products.</p>
          <div className={styles['hero-badge']}><span className={styles['pulse-dot']}></span>12,400+ happy customers</div>
        </div>
      </div>
      <div className={styles.tooltip} ref={tooltipRef}>
        <div className={styles.tipShell}>
          <div className={styles.tipTop}>
            <div className={styles.tipAv} ref={tipAvRef}></div>
            <div><div className={styles.tipName} ref={tipNameRef}></div><div className={styles.tipRole} ref={tipRoleRef}></div></div>
          </div>
          <div className={styles.tipStars} ref={tipStarsRef}></div>
          <div className={styles.tipQuote} ref={tipQuoteRef}></div>
          <div className={styles.tipCaret}></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingTestimonials;