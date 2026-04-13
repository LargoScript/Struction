"use client";
import React, { useRef, useEffect } from 'react';
import { BackgroundProps, ParticleConfig } from '../../types';
import { ParticleSystem } from '../../lib/effects/ParticleSystem';
import { useBackgroundConfig } from '../../hooks/useBackgroundConfig';

const ParticleNetwork: React.FC<BackgroundProps<ParticleConfig>> = ({ children, className = '', config: propsConfig, id }) => {
  const config = useBackgroundConfig(id, 'Particle Network', propsConfig);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const systemRef    = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    systemRef.current = new ParticleSystem(canvas, config);

    const doResize = (w: number, h: number) => {
      systemRef.current?.resize(w, h);
      // Lock CSS height to buffer so the canvas never CSS-stretches on height-only
      // changes (e.g. FAQ accordion open) — prevents the visual jitter.
      canvas.style.height = canvas.height + 'px';
    };

    // Use ResizeObserver (not window resize) so we detect container changes.
    // Only reinitialise on width changes — height-only changes (accordion) are ignored.
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const widthChanged = Math.abs(width - canvas.width) > 10;
      if (widthChanged) doResize(width, height);
    });
    ro.observe(container);

    // Initial size
    doResize(container.clientWidth, container.clientHeight);
    systemRef.current.start();

    return () => {
      ro.disconnect();
      systemRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (systemRef.current && config) {
      systemRef.current.updateConfig(config);
    }
  }, [config]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current && systemRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      systemRef.current.updateMouse(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const bgColor = config?.backgroundColor;
  const defaultBgClass = bgColor ? '' : 'bg-slate-950';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full min-h-screen overflow-hidden ${defaultBgClass} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* top-0 left-0 w-full only — height locked via canvas.style.height in JS */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default ParticleNetwork;
