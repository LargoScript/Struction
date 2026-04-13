"use client";
import React, { useState } from 'react';
import { RegistryProvider } from './lib/context/RegistryContext';
import { ContentProvider } from './lib/context/ContentContext';
import { ContactModalProvider } from './lib/context/ContactModalContext';
import { LangProvider } from './lib/lang';
import { DEFAULT_EFFECTS, DynamicBg, SectionEffect } from './lib/effects';
import { SectionInstance, DEFAULT_SECTIONS } from './lib/sections';

// ─── Maintenance mode ─────────────────────────────────────────────────────────
// Set to true to show the "coming soon" screen to everyone.
// Access the real site via ?dev=1 or the Admin Panel link.
const MAINTENANCE_MODE = false;

const MaintenanceScreen: React.FC = () => (
  <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4 select-none">
    <div className="mb-6 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black font-bold text-sm">ST</div>
    <h1 className="text-2xl font-bold tracking-tight mb-2">Struction</h1>
    <p className="text-zinc-500 text-sm">We're putting the finishing touches on things.</p>
    <p className="text-zinc-600 text-xs mt-1">Check back soon.</p>
  </div>
);

// Sections
import { Navbar } from './components/sections/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { FeatureGrid } from './components/sections/FeatureGrid';
import { CarouselSection } from './components/sections/CarouselSection';
import { FAQSection } from './components/sections/FAQSection';
import { Footer } from './components/sections/Footer';

// Renders the appropriate section component for a given template type
const SectionRenderer: React.FC<{
  section: SectionInstance;
  effects: Record<string, SectionEffect>;
}> = ({ section, effects }) => {
  const bg = <DynamicBg sectionId={section.id} effects={effects} />;
  switch (section.templateId) {
    case 'hero':      return <HeroSection      id={section.id} background={bg} />;
    case 'services':  return <FeatureGrid      id={section.id} background={bg} />;
    case 'portfolio': return <CarouselSection  id={section.id} background={bg} />;
    case 'faq':       return <FAQSection       id={section.id} background={bg} />;
    case 'contact':   return <Footer           id={section.id} background={bg} />;
    default:          return null;
  }
};

const AppInner: React.FC = () => {
  // Always render with published defaults — CMS changes require deployment and
  // never affect the main site directly.
  const [effects]  = useState<Record<string, SectionEffect>>(DEFAULT_EFFECTS);
  const [sections] = useState<SectionInstance[]>(DEFAULT_SECTIONS);

  return (
    <LangProvider>
    <ContactModalProvider>
    <RegistryProvider>
      <div className="bg-black min-h-screen text-white selection:bg-amber-500 selection:text-black">
        <Navbar />
        {[...sections].sort((a, b) => a.order - b.order).map(sec => {
          if (!sec.visible) return null;
          return (
            <ContentProvider key={sec.id} instanceId={sec.id}>
              <SectionRenderer section={sec} effects={effects} />
            </ContentProvider>
          );
        })}

      </div>
    </RegistryProvider>
    </ContactModalProvider>
    </LangProvider>
  );
};

const App: React.FC = () => {
  const [bypass, setBypass] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBypass(params.has('dev') || params.has('preview'));
  }, []);

  if (MAINTENANCE_MODE && !bypass) return <MaintenanceScreen />;
  return <AppInner />;
};

export default App;
