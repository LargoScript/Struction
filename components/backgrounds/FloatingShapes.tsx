"use client";
import React from 'react';
import { BackgroundProps, ShapeConfig } from '../../types';
import { useBackgroundConfig } from '../../hooks/useBackgroundConfig';

const FloatingShapes: React.FC<BackgroundProps<ShapeConfig>> = ({ children, className = '', config: propsConfig, id }) => {
  const config = useBackgroundConfig(id, 'Floating Shapes', propsConfig);
  const bg = config?.backgroundColor || 'bg-slate-50';
  const shapeColors = config?.colors || ['bg-emerald-400', 'bg-teal-500', 'bg-cyan-300', 'bg-emerald-600', 'bg-teal-300'];
  const count = config?.shapeCount || 5;

  const isHex = (color?: string) => color?.startsWith('#') || color?.startsWith('rgb') || color === 'transparent';

  const shapes = Array.from({ length: count }).map((_, i) => ({
    type: i % 2 === 0 ? 'circle' : 'square',
    color: shapeColors[i % shapeColors.length],
    size: ['w-24 h-24', 'w-32 h-32', 'w-16 h-16', 'w-40 h-40', 'w-20 h-20'][i % 5],
    pos: [
        'top-10 left-[10%]', 
        'bottom-20 right-[15%]', 
        'top-[40%] left-[60%]', 
        'top-20 right-10', 
        'bottom-[30%] left-20'
    ][i % 5],
    delay: `${i}s`
  }));

  return (
    <div 
      className={`relative w-full h-full min-h-screen overflow-hidden ${className} ${!isHex(bg) ? bg : ''}`} 
      style={{ backgroundColor: isHex(bg) ? bg : undefined }}
    >
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {shapes.map((shape, i) => (
          <div
            key={i}
            className={`absolute ${shape.size} ${!isHex(shape.color) ? shape.color : ''} ${shape.pos} opacity-40 mix-blend-multiply filter blur-xl animate-[float_8s_ease-in-out_infinite]`}
            style={{ 
                animationDelay: shape.delay, 
                borderRadius: shape.type === 'circle' ? '50%' : '1rem',
                backgroundColor: isHex(shape.color) ? shape.color : undefined
            }}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-0"></div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default FloatingShapes;