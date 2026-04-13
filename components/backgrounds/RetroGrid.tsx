"use client";
import React from 'react';
import { BackgroundProps, GridConfig } from '../../types';
import { useBackgroundConfig } from '../../hooks/useBackgroundConfig';

const RetroGrid: React.FC<BackgroundProps<GridConfig>> = ({ children, className = '', config: propsConfig, id }) => {
  const config = useBackgroundConfig(id, 'Retro Grid', propsConfig);
  const gridColor = config?.gridColor || '#444';
  const bgColor = config?.backgroundColor || '#0a0a0a';
  const speed = config?.animationSpeed ? `${config.animationSpeed}s` : '1s';

  return (
    <div className={`relative w-full h-full min-h-screen overflow-hidden ${className}`} style={{ backgroundColor: bgColor }}>
      
      {bgColor !== 'transparent' && (
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-purple-900/30 via-transparent to-transparent z-0 pointer-events-none"></div>
      )}

      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-[size:40px_40px] animate-[grid-move_linear_infinite]"
          style={{
            backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
            opacity: 0.25,
            animationDuration: speed
          }}
        ></div>
      </div>

      {bgColor !== 'transparent' && (
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-1 pointer-events-none"></div>
      )}

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default RetroGrid;