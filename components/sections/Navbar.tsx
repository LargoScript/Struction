"use client";
import React, { useState } from 'react';
import { useContactModal } from '../../lib/context/ContactModalContext';
import { scrollToSectionId } from '../../lib/scrollToSectionId';
import { useLang } from '../../lib/lang';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openContactModal } = useContactModal();
  const { lang, setLang } = useLang();

  const toggleLang = () => {
    const next = lang === 'en' ? 'uk' : 'en';
    setLang(next);
    window.location.hash = next === 'uk' ? 'ua' : 'en';
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsOpen(false);
    scrollToSectionId(id);
  };

  const navLinks = lang === 'uk'
    ? [
        { name: 'Послуги',   id: 'services' },
        { name: 'Портфоліо', id: 'portfolio' },
        { name: 'FAQ',       id: 'faq' },
        { name: 'Контакти',  id: 'contact' },
      ]
    : [
        { name: 'Services',  id: 'services' },
        { name: 'Portfolio', id: 'portfolio' },
        { name: 'FAQ',       id: 'faq' },
        { name: 'Contact',   id: 'contact' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 h-14 shadow-2xl relative">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" onClick={(e) => scrollToSection(e, 'hero-section')} className="flex items-center gap-2 z-50 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-xs">ST</div>
            <span className="text-white font-bold text-lg tracking-tight">Struction</span>
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            {navLinks.map((link) => (
                <a 
                    key={link.name}
                    href={`#${link.id}`} 
                    onClick={(e) => scrollToSection(e, link.id)}
                    className="hover:text-amber-400 transition-colors"
                >
                    {link.name}
                </a>
            ))}
          </div>

          {/* Lang + CTA (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs font-bold text-neutral-400 hover:text-white border border-white/20 hover:border-white/50 rounded-md px-2.5 py-1.5 transition-colors"
            >
              {lang === 'en' ? 'UA' : 'EN'}
            </button>
            <button
                type="button"
                onClick={() => openContactModal()}
                className="bg-amber-500 text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors"
            >
              {lang === 'uk' ? 'Обговорити проект' : 'Discuss a Project'}
            </button>
          </div>

          {/* Mobile Burger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Mobile Menu Overlay */}
          <div className={`absolute top-full left-0 w-full bg-neutral-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-6 ${isOpen ? 'max-h-screen py-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
            {navLinks.map((link) => (
                <a 
                    key={link.name}
                    href={`#${link.id}`} 
                    className="text-lg font-medium text-white hover:text-amber-400" 
                    onClick={(e) => scrollToSection(e, link.id)}
                >
                    {link.name}
                </a>
            ))}
            <button
                type="button"
                onClick={() => openContactModal()}
                className="bg-amber-500 text-black px-8 py-3 rounded-lg text-lg font-bold w-3/4 text-center"
            >
              {lang === 'uk' ? 'Обговорити проект' : 'Discuss a Project'}
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); toggleLang(); }}
              className="text-sm font-bold text-neutral-400 hover:text-white border border-white/20 rounded-md px-4 py-2 transition-colors"
            >
              {lang === 'en' ? 'Перейти на UA' : 'Switch to EN'}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};