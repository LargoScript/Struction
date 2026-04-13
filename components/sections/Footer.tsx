"use client";
import React, { ReactNode } from 'react';
import { useContent } from '../../lib/context/ContentContext';
import { SectionManifest } from '../../lib/struction-cms/types';

export const manifest: SectionManifest = {
  templateId: 'contact',
  label: 'Footer / Contact',
  supportsBackground: false,
  fields: [
    { key: 'footer.tagline',         label: 'Tagline',          type: 'textarea' },
    { key: 'footer.email',           label: 'Email',            type: 'text' },
    { key: 'footer.phone',           label: 'Phone',            type: 'text' },
    { key: 'footer.socialInstagram', label: 'Instagram URL',    type: 'url' },
    { key: 'footer.socialTwitter',   label: 'Twitter / X URL',  type: 'url' },
    { key: 'footer.socialLinkedin',  label: 'LinkedIn URL',     type: 'url' },
    { key: 'footer.socialBehance',   label: 'Behance URL',      type: 'url' },
  ],
};

const navLinks = [
  { name: 'Services',   href: '#services' },
  { name: 'Portfolio',  href: '#portfolio' },
  { name: 'FAQ',        href: '#faq' },
  { name: 'Contact',    href: '#contact' },
  { name: 'About Us',   href: '#' },
];

interface FooterProps {
  background: ReactNode;
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({ background, id }) => {
  const { activeContent } = useContent();
  const f = activeContent.footer;

  return (
    <footer id={id} className="relative min-h-[500px] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        {background}
      </div>

      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

      <div className="relative z-20 container mx-auto px-4 pb-12">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-12 flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <h3 className="text-3xl font-bold text-white mb-2">Struction</h3>
            <p className="text-neutral-400 max-w-sm mb-6">{f.tagline}</p>
            <div className="flex flex-col gap-1 text-sm text-neutral-300">
              <a href={`mailto:${f.email}`} className="hover:text-indigo-400 transition-colors">{f.email}</a>
              <a href={`tel:${f.phone.replace(/\s/g, '')}`} className="hover:text-indigo-400 transition-colors">{f.phone}</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold mb-1">Navigation</h4>
              {navLinks.map(link => (
                <a key={link.name} href={link.href} className="text-neutral-400 hover:text-white transition-colors">
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold mb-1">Social</h4>
              <a href={f.socialInstagram} className="text-neutral-400 hover:text-white transition-colors">Instagram</a>
              <a href={f.socialTwitter}   className="text-neutral-400 hover:text-white transition-colors">Twitter / X</a>
              <a href={f.socialLinkedin}  className="text-neutral-400 hover:text-white transition-colors">LinkedIn</a>
              <a href={f.socialBehance}   className="text-neutral-400 hover:text-white transition-colors">Behance</a>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 text-neutral-600 text-xs px-2">
          <span>&copy; {new Date().getFullYear()} Struction. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-400">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
