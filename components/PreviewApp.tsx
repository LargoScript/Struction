"use client";
/**
 * PreviewApp — lightweight site renderer used inside the CMS iframe.
 *
 * Uses a SINGLE ContentProvider (no instanceId) so it reads from the same
 * storage key as the CMS editor: struction_content_en / struction_content_uk.
 * Previously each section had its own ContentProvider with instanceId, which
 * read from different keys (struction_content_services etc.) — edits were
 * invisible in preview.
 */
import React, { useState, useEffect } from 'react';
import { ContentProvider } from '../lib/context/ContentContext';
import { ContactModalProvider } from '../lib/context/ContactModalContext';
import { loadEffects, DynamicBg, SectionEffect } from '../lib/effects';
import { SectionInstance, loadSections } from '../lib/sections';

import { Navbar } from './sections/Navbar';
import { HeroSection } from './sections/HeroSection';
import { FeatureGrid } from './sections/FeatureGrid';
import { CarouselSection } from './sections/CarouselSection';
import { FAQSection } from './sections/FAQSection';
import { Footer } from './sections/Footer';

const PreviewApp: React.FC = () => {
  const [effects,  setEffects]  = useState<Record<string, SectionEffect>>(loadEffects);
  const [sections, setSections] = useState<SectionInstance[]>(loadSections);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'struction_effects' || e.key === null) setEffects(loadEffects());
      if (e.key === 'struction_sections' || e.key === null) setSections(loadSections());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const sorted = [...sections].filter(s => s.visible).sort((a, b) => a.order - b.order);

  return (
    // No RegistryProvider here — background components read propsConfig directly
    // (registry caches the initial config and ignores subsequent updates)
    <ContactModalProvider>
    <ContentProvider>
      <div className="bg-black min-h-screen text-white selection:bg-amber-500 selection:text-black">
        <Navbar />
        {sorted.map(sec => {
          const bg = <DynamicBg sectionId={sec.id} effects={effects} />;
          switch (sec.templateId) {
            case 'hero':      return <HeroSection     key={sec.id} id={sec.id} background={bg} />;
            case 'services':  return <FeatureGrid     key={sec.id} id={sec.id} background={bg} />;
            case 'portfolio': return <CarouselSection key={sec.id} id={sec.id} background={bg} />;
            case 'faq':       return <FAQSection      key={sec.id} id={sec.id} background={bg} />;
            case 'contact':   return <Footer          key={sec.id} id={sec.id} background={bg} />;
            default:          return null;
          }
        })}
      </div>
    </ContentProvider>
    </ContactModalProvider>
  );
};

export default PreviewApp;
