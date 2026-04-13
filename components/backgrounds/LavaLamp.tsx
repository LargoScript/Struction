"use client";
/**
 * LavaLamp — canvas-based fluid metaball effect.
 *
 * Technique: colored radial-gradient blobs rendered with 'lighter' compositing
 * on a solid background, then CSS blur + contrast creates the merging "lava" look.
 *
 * configRef pattern: animation loop never restarts on config/prop changes —
 * no more stopping when user interacts with CMS controls.
 */
import React, { useRef, useEffect } from 'react';
import { BackgroundProps, LavaLampConfig, LavaColorStop } from '../../types';

interface Blob {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  colorIdx: number;
  color: string;
}

// Parse any color string to rgba(r,g,b,alpha)
function toRgba(color: string, alpha: number): string {
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\s*\)$/, `, ${alpha})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  const full =
    color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Interpolate a hex/rgb color toward black by t (0=black, 1=full color)
function dimColor(color: string, t: number): string {
  const full =
    color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;
  const parse = (s: string) => [
    parseInt(s.slice(1, 3), 16),
    parseInt(s.slice(3, 5), 16),
    parseInt(s.slice(5, 7), 16),
  ];
  let rgb: number[];
  if (full.startsWith('#')) {
    rgb = parse(full);
  } else {
    const m = full.match(/\d+/g) ?? ['0', '0', '0'];
    rgb = [+m[0], +m[1], +m[2]];
  }
  const [r, g, b] = rgb.map(c => Math.round(c * t));
  return `rgb(${r},${g},${b})`;
}

const DEFAULT_STOPS: LavaColorStop[] = [
  { color: '#f59e0b', weight: 50 },
  { color: '#7c3aed', weight: 50 },
];
const DEFAULT_BG = '#1a0032';

/**
 * Build a flat color list of length `count` respecting stop weights.
 * e.g. [{color:'#f00', weight:33}, {color:'#00f', weight:67}], count=6
 *   → ['#f00','#f00','#00f','#00f','#00f','#00f']
 * Then shuffle so colors are spread evenly, not all one color on one side.
 */
function buildColorList(stops: LavaColorStop[], count: number): string[] {
  const total = stops.reduce((s, st) => s + st.weight, 0) || 1;
  const result: string[] = [];
  let remainder = 0;
  stops.forEach(st => {
    const exact = (st.weight / total) * count + remainder;
    const n = Math.round(exact);
    remainder = exact - n;
    for (let i = 0; i < n; i++) result.push(st.color);
  });
  // Pad / trim to exactly count
  while (result.length < count) result.push(stops[stops.length - 1].color);
  result.length = count;
  // Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const LavaLamp: React.FC<BackgroundProps<LavaLampConfig>> = ({
  children,
  className = '',
  config: propsConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef(0);
  const blobsRef     = useRef<Blob[]>([]);
  const sizeRef      = useRef({ w: 0, h: 0 });
  // Keep latest config accessible inside the draw loop without restarting it
  const cfgRef    = useRef(propsConfig);
  const reinitRef = useRef<((w: number, h: number) => void) | null>(null);
  useEffect(() => { cfgRef.current = propsConfig; }, [propsConfig]);

  // Re-initialize blobs when blob-related config changes (density, size, colors)
  const colorStopsKey = JSON.stringify(propsConfig?.colorStops);
  useEffect(() => {
    if (reinitRef.current && sizeRef.current.w > 0) {
      reinitRef.current(sizeRef.current.w, sizeRef.current.h);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsConfig?.blobDensity, propsConfig?.blobSize, colorStopsKey]);

  // Single effect — never re-runs; all live values come through refs
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initBlobs = (w: number, h: number) => {
      sizeRef.current = { w, h };
      const cfg       = cfgRef.current;
      const density   = cfg?.blobDensity ?? 1;
      const sizeMul   = cfg?.blobSize ?? 1;
      const count     = Math.max(3, Math.min(25, Math.round(density * w * h / 100_000)));
      const stops     = cfg?.colorStops?.length ? cfg.colorStops : DEFAULT_STOPS;
      const palette   = buildColorList(stops, count);

      blobsRef.current = Array.from({ length: count }, (_, i) => {
        const base = Math.sqrt(w * h);
        const r    = Math.min(base * (0.08 + Math.random() * 0.14) * sizeMul, Math.min(w, h) * 0.5);
        return {
          x: r + Math.random() * (w - 2 * r),
          y: r + Math.random() * (h - 2 * r),
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          r,
          colorIdx: i,
          color: palette[i],
        };
      });
    };

    reinitRef.current = initBlobs;

    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const widthChanged = Math.abs(width - sizeRef.current.w) > 10;
      if (widthChanged) {
        // Width change: resize buffer (clears canvas — expected for layout change) + reinit blobs
        canvas.width  = Math.round(width);
        canvas.height = Math.round(height);
        canvas.style.height = canvas.height + 'px';
        initBlobs(width, height);
      }
      // Height-only change (e.g. FAQ accordion): do nothing.
      // canvas.height assignment always clears the buffer — skipping it means the
      // draw loop continues uninterrupted. CSS `h-full` stretches the canvas
      // visually to fill the new container height with no flash.
    });
    ro.observe(container);
    canvas.width  = container.clientWidth;
    canvas.height = container.clientHeight;
    // Lock CSS height to buffer — prevents CSS from stretching the canvas
    // when only the section height grows (e.g. FAQ accordion opens).
    canvas.style.height = canvas.height + 'px';
    initBlobs(container.clientWidth, container.clientHeight);

    const draw = () => {
      const { w, h } = sizeRef.current;
      const cfg     = cfgRef.current;
      const speed   = cfg?.speed ?? 1;
      const bgColor = cfg?.backgroundColor ?? DEFAULT_BG;

      // Fill background — use the configured color directly, same as FloatingShapes
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // Additive blending: overlapping blobs brighten each other
      ctx.globalCompositeOperation = 'lighter';

      blobsRef.current.forEach(b => {
        // Physics
        b.x += b.vx * speed;
        b.y += b.vy * speed;
        // Bounce — use absolute velocity to avoid sticking at corners
        if (b.x - b.r < 0)  { b.x = b.r;     b.vx =  Math.abs(b.vx); }
        if (b.x + b.r > w)  { b.x = w - b.r;  b.vx = -Math.abs(b.vx); }
        if (b.y - b.r < 0)  { b.y = b.r;     b.vy =  Math.abs(b.vy); }
        if (b.y + b.r > h)  { b.y = h - b.r;  b.vy = -Math.abs(b.vy); }

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        const color = b.color;
        grad.addColorStop(0,    toRgba(color, 1.0));
        grad.addColorStop(0.45, toRgba(color, 0.8));
        grad.addColorStop(0.8,  toRgba(color, 0.3));
        grad.addColorStop(1,    toRgba(color, 0.0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []); // intentionally empty — loop is fully ref-driven

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen overflow-hidden ${className}`}
      style={{ backgroundColor: propsConfig?.backgroundColor ?? DEFAULT_BG }}
    >
      {/*
        blur: makes blobs bleed into each other
        contrast(18): thresholds the blurred signal → sharp merged surfaces
        Together this is the classic CSS metaball trick.
      */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full"
        style={{ filter: 'blur(28px) contrast(18)' }}
      />
      <div className="relative z-10 w-full h-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

export default LavaLamp;
