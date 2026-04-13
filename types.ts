import { ReactNode } from 'react';

export interface BackgroundProps<T = any> {
  id?: string; // Unique identifier for the registry
  children?: ReactNode;
  className?: string;
  config?: T;
}

// --- Configuration Interfaces ---

export interface HeroConfig {
  badge?: string;
  title?: string;
  description?: string;
  mediaType?: 'video' | 'image';
  mediaSrc?: string;
  poster?: string;
  buttonText?: string;
}

export interface ParticleConfig {
  particleDensity?: number; // particles per 100 000 px² — auto-scales with canvas size
  particleCount?: number;   // legacy fallback (ignored when particleDensity is set)
  connectionDistance?: number;
  mouseDistance?: number;
  particleColor?: string;
  lineColor?: string;
  baseSpeed?: number;
  interactionStrength?: number;
  resistance?: number;
  enableMouseInteraction?: boolean;
  wrapAround?: boolean;
  backgroundColor?: string;
}

export interface WaveConfig {
  colorStart?: string;
  colorEnd?: string;
  waveColor?: string;
  speed?: number;
  amplitude?: number;
  parallax?: number; // 0 = normal scroll, 1 = fixed position
}

export interface GridConfig {
  gridColor?: string;
  backgroundColor?: string;
  animationSpeed?: number;
}

export interface GradientMeshItem {
  color: string;
  top: string;  // e.g., "10%" or "-50px"
  left: string; // e.g., "50%"
  width: string; // e.g., "24rem"
  height: string;
  animationDelay: string;
  animationDuration: string;
  opacity: number;
}

export interface GradientMeshConfig {
  backgroundColor?: string;
  animationSpeed?: string | number; // Global multiplier
  items?: GradientMeshItem[]; 
  // Legacy support for older saved configs (optional)
  blobColors?: string[]; 
}

export interface ShapeConfig {
  backgroundColor?: string;
  shapeCount?: number;
  colors?: string[];
}

export interface LavaColorStop {
  color: string;
  weight: number; // relative weight, e.g. 50 / 50 or 33 / 33 / 34
}

export interface LavaLampConfig {
  backgroundColor?: string;
  colorStops?: LavaColorStop[]; // weighted color distribution
  colors?: string[];            // legacy fallback (plain array)
  speed?: number;
  blobDensity?: number;
  blobSize?: number;    // size multiplier: 0.3 = tiny, 1.0 = default, 2.0 = large
  blobCount?: number;
}