"use client";
import React, { ReactNode } from 'react';
import { useContent } from '../../lib/context/ContentContext';
import { ICONS } from '../../lib/icons';
import { SectionManifest } from '../../lib/struction-cms/types';
import { HOVER_CSS_CLASSES, HoverKey } from '../../lib/struction-cms/animations';

export const manifest: SectionManifest = {
  templateId: 'services',
  label: 'Services',
  supportsBackground: true,
  fields: [
    { key: 'features.heading',    label: 'Heading',    type: 'text' },
    { key: 'features.subheading', label: 'Subheading', type: 'textarea' },
  ],
  lists: [{
    key: 'features.cards',
    label: 'Service Cards',
    defaultItem: { title: 'New Service', desc: 'Service description.', iconKey: 'star' },
    itemLabelKey: 'title',
    fields: [
      { key: 'title',   label: 'Title',       type: 'text' },
      { key: 'desc',    label: 'Description', type: 'textarea' },
      { key: 'iconKey', label: 'Icon',        type: 'icon' },
    ],
  }],
  animations: [
    { key: 'animations.cardHover', label: 'Card Hover Effect', options: ['none', 'lift', 'scale', 'glow'], default: 'lift' },
  ],
};

interface FeatureGridProps {
  background: ReactNode;
  id?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ background, id }) => {
  const { activeContent } = useContent();
  const { heading, subheading, cards } = activeContent.features;
  const cardHover = ((activeContent as any).animations?.cardHover ?? 'lift') as HoverKey;
  const hoverClass = HOVER_CSS_CLASSES[cardHover] ?? HOVER_CSS_CLASSES.lift;

  return (
    <section id={id} className="relative py-32 overflow-hidden bg-neutral-900 border-t border-white/5">
      <div className="absolute inset-0 z-0 opacity-40">{background}</div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />

      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{heading}</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">{subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => {
            const Icon = ICONS[card.iconKey] || ICONS.star;
            return (
              <div key={card.id} className={`group relative p-8 rounded-2xl bg-zinc-800/80 border border-white/10 hover:bg-zinc-700/80 hover:border-amber-500/40 transition-all ${hoverClass}`}>
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 text-amber-400 group-hover:text-black group-hover:bg-amber-400 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
