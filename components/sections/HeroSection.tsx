"use client";
import React, { ReactNode } from 'react';
import { useContent } from '../../lib/context/ContentContext';
import { useContactModal } from '../../lib/context/ContactModalContext';
import { scrollToSectionId } from '../../lib/scrollToSectionId';
import { SectionManifest } from '../../lib/struction-cms/types';

export const manifest: SectionManifest = {
  templateId: 'hero',
  label: 'Hero',
  supportsBackground: true,
  fields: [
    { key: 'hero.badge',           label: 'Badge',            type: 'text' },
    { key: 'hero.titleLine1',      label: 'Title — Line 1',   type: 'text' },
    { key: 'hero.titleHighlight',  label: 'Title — Highlight',type: 'text' },
    { key: 'hero.description',     label: 'Description',      type: 'textarea' },
    { key: 'hero.primaryButton',   label: 'Primary Button',   type: 'text' },
    { key: 'hero.secondaryButton', label: 'Secondary Button', type: 'text' },
    { key: 'hero.videoSrc',        label: 'Video / Image URL',type: 'url',   placeholder: '/videos/hero.mp4' },
    { key: 'hero.poster',          label: 'Poster',           type: 'image', placeholder: '/images/hero-poster.jpg' },
  ],
};

interface HeroSectionProps {
  id?: string;
  background?: ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ id = 'hero-section', background }) => {
  const { activeContent } = useContent();
  const { openContactModal } = useContactModal();
  const hero = activeContent.hero;

  return (
    <header id={id} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20 pb-10">

      {/* Media Layer */}
      {hero.videoSrc && (
        <div className="absolute inset-0 z-0">
          {hero.videoSrc.match(/\.(mp4|webm)$/i) ? (
            <video
              className="w-full h-full object-cover opacity-60"
              autoPlay muted loop playsInline
              poster={hero.poster}
              key={hero.videoSrc}
            >
              <source src={hero.videoSrc} type="video/mp4" />
            </video>
          ) : (
            <img src={hero.videoSrc} alt="Background" className="w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-black/50 mix-blend-multiply" />
        </div>
      )}

      {/* Dynamic Background Layer */}
      {background && (
        <div className="absolute inset-0 z-[1] mix-blend-overlay opacity-30">
          {background}
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-20 container mx-auto px-4 text-center flex flex-col justify-center h-full">
        <div className="animate-fade-in-up">
          {hero.badge && (
            <div className="inline-block mb-6 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-amber-300 text-[10px] md:text-xs font-bold tracking-widest uppercase">
              {hero.badge}
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl max-w-5xl mx-auto leading-[1.1] flex flex-col items-center gap-2">
            <span className="block">{hero.titleLine1}</span>
            <span className="block text-amber-400">{hero.titleHighlight}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md font-light px-2">
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={() => openContactModal()}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {hero.primaryButton}
            </button>
            <button
              type="button"
              onClick={() => scrollToSectionId('portfolio')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-bold backdrop-blur-md transition-all"
            >
              {hero.secondaryButton}
            </button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 hidden sm:flex justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
          <span className="text-white font-bold text-sm md:text-xl">SHOPIFY</span>
          <span className="text-white font-bold text-sm md:text-xl">WORDPRESS</span>
          <span className="text-white font-bold text-sm md:text-xl">REACT</span>
          <span className="text-white font-bold text-sm md:text-xl">GOOGLE ADS</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none" />
    </header>
  );
};
