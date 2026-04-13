"use client";
import React from 'react';
import { defaultConfigs } from './schemas';

import GradientMesh from '../components/backgrounds/GradientMesh';
import RetroGrid from '../components/backgrounds/RetroGrid';
import LavaLamp from '../components/backgrounds/LavaLamp';
import ParticleNetwork from '../components/backgrounds/ParticleNetwork';
import FloatingShapes from '../components/backgrounds/FloatingShapes';
import Waves from '../components/backgrounds/Waves';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BgType =
  | 'none'
  | 'GradientMesh'
  | 'RetroGrid'
  | 'LavaLamp'
  | 'ParticleNetwork'
  | 'FloatingShapes'
  | 'Waves';

export interface SectionEffect {
  type: BgType;
  config: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const BG_OPTIONS: BgType[] = [
  'none', 'GradientMesh', 'RetroGrid', 'LavaLamp', 'ParticleNetwork', 'FloatingShapes', 'Waves',
];

export const BG_LABELS: Record<BgType, string> = {
  none: 'No effect',
  GradientMesh: 'Gradient Mesh',
  RetroGrid: 'Retro Grid',
  LavaLamp: 'Lava Lamp',
  ParticleNetwork: 'Particle Network',
  FloatingShapes: 'Floating Shapes',
  Waves: 'Sine Waves',
};

export const BG_SCHEMA_KEY: Record<BgType, string> = {
  none: '',
  GradientMesh: 'Gradient Mesh',
  RetroGrid: 'Retro Grid',
  LavaLamp: 'Lava Lamp',
  ParticleNetwork: 'Particle Network',
  FloatingShapes: 'Floating Shapes',
  Waves: 'Sine Waves',
};

export const BG_COMPONENTS: Record<string, React.FC<any>> = {
  GradientMesh,
  RetroGrid,
  LavaLamp,
  ParticleNetwork,
  FloatingShapes,
  Waves,
};

// ─── Default effects (used when nothing is saved) ─────────────────────────────
// Keyed by section instance ID — matches DEFAULT_SECTIONS in lib/sections.ts.

export const DEFAULT_EFFECTS: Record<string, SectionEffect> = {
  'hero-section': { type: 'GradientMesh',   config: { ...defaultConfigs['Gradient Mesh'] } },
  services:       { type: 'RetroGrid',      config: { ...defaultConfigs['Retro Grid'] } },
  portfolio:      { type: 'FloatingShapes', config: { ...defaultConfigs['Floating Shapes'] } },
  faq:            {
    type: 'Waves',
    config: {
      ...defaultConfigs['Sine Waves'],
      colorStart: '#1e1b4b',
      colorEnd: '#312e81',
      waveColor: 'rgba(129, 140, 248, 0.3)',
      speed: 1,
      amplitude: 50,
      parallax: 1,
    },
  },
  contact:        { type: 'none',           config: {} },
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const EFFECTS_KEY = 'struction_effects';

export function loadEffects(): Record<string, SectionEffect> {
  try {
    const raw = localStorage.getItem(EFFECTS_KEY);
    if (raw) return { ...DEFAULT_EFFECTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_EFFECTS };
}

export function saveEffects(effects: Record<string, SectionEffect>) {
  try {
    localStorage.setItem(EFFECTS_KEY, JSON.stringify(effects));
    // Notify preview iframes (only from CMS, not from within the iframe itself)
    if (!new URLSearchParams(window.location.search).has('preview')) {
      const bc = new BroadcastChannel('cms_sync');
      bc.postMessage('effects');
      bc.close();
    }
  } catch {}
}

// ─── DynamicBg component (shared between CMS preview and PreviewApp) ──────────

export const DynamicBg: React.FC<{
  sectionId: string;
  effects: Record<string, SectionEffect>;
}> = ({ sectionId, effects }) => {
  const ef = effects[sectionId];
  if (!ef || ef.type === 'none') return null;
  const Comp = BG_COMPONENTS[ef.type];
  if (!Comp) return null;
  return <Comp id={`bg-${sectionId}`} config={ef.config} />;
};
