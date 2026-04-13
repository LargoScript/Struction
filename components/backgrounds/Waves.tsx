"use client";
import React, { useRef, useEffect } from 'react';
import { BackgroundProps, WaveConfig } from '../../types';
import { WaveSystem } from '../../lib/effects/WaveSystem';
import { useBackgroundConfig } from '../../hooks/useBackgroundConfig';

const Waves: React.FC<BackgroundProps<WaveConfig>> = ({ children, className = '', config: propsConfig, id }) => {
  const config       = useBackgroundConfig(id, 'Sine Waves', propsConfig);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const systemRef    = useRef<WaveSystem | null>(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    systemRef.current = new WaveSystem(canvas, config);
    systemRef.current.start();

    // Only reinitialise on width changes — height-only changes (e.g. FAQ accordion)
    // are ignored so the canvas buffer never clears and there is no flash.
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const widthChanged = Math.abs(width - canvas.width) > 10;
      if (widthChanged) {
        systemRef.current?.resize(width, height);
        // canvas.style.height is locked by WaveSystem after applying the deferred resize
      }
    });
    ro.observe(container);

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

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen ${className}`}
      style={{ backgroundColor: config?.colorStart || '#1e1b4b' }}
    >
      {/* height locked via canvas.style.height in WaveSystem after each buffer resize */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full block" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default Waves;
