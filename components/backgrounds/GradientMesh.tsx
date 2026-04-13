"use client";
import React from 'react';
import { BackgroundProps, GradientMeshConfig, GradientMeshItem } from '../../types';
import { useBackgroundConfig } from '../../hooks/useBackgroundConfig';

const GradientMesh: React.FC<BackgroundProps<GradientMeshConfig>> = ({ children, className = '', config: propsConfig, id }) => {
  const config = useBackgroundConfig(id, 'Gradient Mesh', propsConfig);
  
  const bg = config?.backgroundColor || 'bg-slate-900';
  
  let items: GradientMeshItem[] = config?.items || [];
  
  if (items.length === 0 && config?.blobColors && config.blobColors.length > 0) {
      items = [
          { color: config.blobColors[0], top: '0', left: '-1rem', width: '18rem', height: '18rem', animationDelay: '0s', animationDuration: '7s', opacity: 0.7 },
          { color: config.blobColors[1], top: '0', left: '100%', width: '18rem', height: '18rem', animationDelay: '2s', animationDuration: '7s', opacity: 0.7 },
          { color: config.blobColors[2] || config.blobColors[0], top: '100%', left: '20%', width: '18rem', height: '18rem', animationDelay: '4s', animationDuration: '7s', opacity: 0.7 },
          { color: config.blobColors[3] || config.blobColors[1], top: '60%', left: '60%', width: '24rem', height: '24rem', animationDelay: '5s', animationDuration: '10s', opacity: 0.6 }
      ];
      items[1].left = 'unset';
      (items[1] as any).right = '-1rem';
  }

  if (items.length === 0) {
      items = [
        { color: '#a855f7', top: '0', left: '0', width: '20rem', height: '20rem', animationDelay: '0s', animationDuration: '7s', opacity: 0.7 }
      ];
  }

  const isHex = (color?: string) => color?.startsWith('#') || color?.startsWith('rgb') || color === 'transparent';
  const globalSpeed = config?.animationSpeed ?? 7;

  return (
    <div 
        className={`relative w-full h-full min-h-screen overflow-hidden ${!isHex(bg) ? bg : ''} ${className}`} 
        style={{ backgroundColor: isHex(bg) ? bg : undefined }}
    >
      <div className={`absolute inset-0 w-full h-full z-0`} />
      {items.map((item, i) => {
        const animDuration = typeof globalSpeed === 'number' ? `${globalSpeed}s` : (item.animationDuration || '7s');
        return (
            <div 
                key={i}
                className={`absolute rounded-full mix-blend-multiply filter blur-3xl animate-[blob_infinite]`} 
                style={{
                    backgroundColor: isHex(item.color) ? item.color : undefined,
                    top: item.top,
                    left: item.left,
                    right: (item as any).right,
                    bottom: (item as any).bottom,
                    width: item.width,
                    height: item.height,
                    animationDelay: item.animationDelay,
                    animationDuration: animDuration,
                    opacity: item.opacity
                }}
            >
                {!isHex(item.color) && <div className={`w-full h-full rounded-full ${item.color}`} />}
            </div>
        );
      })}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default GradientMesh;