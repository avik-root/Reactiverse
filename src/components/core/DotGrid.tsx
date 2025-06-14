// Ensure this component is treated as a client component
'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

// Note: DotGrid.css is imported globally in layout.tsx

gsap.registerPlugin(InertiaPlugin);

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 16,
  gap = 32,
  baseColor = "#5227FF", // Default base color
  activeColor = "#5227FF", // Default active color
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = "",
  style,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  const [circlePath, setCirclePath] = useState<Path2D | null>(null);

  useEffect(() => {
    // Create Path2D object only on the client side after mount
    if (typeof Path2D !== 'undefined' && dotSize > 0) {
      const p = new Path2D();
      p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
      setCirclePath(p);
    }
  }, [dotSize]);

  const baseRgb = useMemo(() => hexToRgb(baseColor!), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor!), [activeColor]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.floor((width + gap!) / (dotSize! + gap!));
    const rows = Math.floor((height + gap!) / (dotSize! + gap!));
    const cell = dotSize! + gap!;

    const gridW = cell * cols - gap!;
    const gridH = cell * rows - gap!;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize! / 2;
    const startY = extraY / 2 + dotSize! / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    // Ensure this effect runs only on the client
    if (typeof window === "undefined" || !circlePath) return;

    let rafId: number;
    const proxSq = proximity! * proximity!;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let styleToApply = baseColor!;
        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity!;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          styleToApply = `rgb(${r},${g},${b})`;
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = styleToApply;
        ctx.fill(circlePath); // Use the stateful circlePath
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [proximity, baseColor, activeRgb, baseRgb, circlePath]); // circlePath is now a dependency

  useEffect(() => {
    // Ensure this effect runs only on the client
    if (typeof window === "undefined") return;
    
    buildGrid();
    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(buildGrid);
      if (wrapperRef.current) {
        ro.observe(wrapperRef.current);
      }
    } else {
      (window as Window).addEventListener("resize", buildGrid);
    }
    return () => {
      if (ro && wrapperRef.current) ro.unobserve(wrapperRef.current);
      else if ("ResizeObserver" in window === false) window.removeEventListener("resize", buildGrid);
    };
  }, [buildGrid]);

  useEffect(() => {
    // Ensure this effect runs only on the client
    if (typeof window === "undefined") return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16; 
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      let vx = dt > 0 ? (dx / dt) * 1000 : 0; 
      let vy = dt > 0 ? (dy / dt) * 1000 : 0; 
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed!) {
        const scale = maxSpeed! / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed!;
      }
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        pr.x = e.clientX - rect.left;
        pr.y = e.clientY - rect.top;
      }


      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed > speedTrigger! && dist < proximity! && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const pushX = dot.cx - pr.x + vx * 0.005;
          const pushY = dot.cy - pr.y + vy * 0.005;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance: resistance! },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration!,
                ease: "elastic.out(1,0.75)",
              });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius! && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / shockRadius!);
          const pushX = (dot.cx - cx) * shockStrength! * falloff;
          const pushY = (dot.cy - cy) * shockStrength! * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance: resistance! },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration!,
                ease: "elastic.out(1,0.75)",
              });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const throttledMove = throttle(onMove, 16); 
    window.addEventListener("mousemove", throttledMove, { passive: true });
    window.addEventListener("click", onClick);

    pointerRef.current.lastX = pointerRef.current.x;
    pointerRef.current.lastY = pointerRef.current.y;
    pointerRef.current.lastTime = performance.now();


    return () => {
      window.removeEventListener("mousemove", throttledMove);
      window.removeEventListener("click", onClick);
      dotsRef.current.forEach(dot => gsap.killTweensOf(dot));
    };
  }, [
    maxSpeed,
    speedTrigger,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
  ]);

  return (
    <section className={`dot-grid ${className}`} style={style}>
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </section>
  );
};

export default DotGrid;
