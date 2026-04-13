'use client';
import { useState, type MouseEvent } from 'react';
import { useLang } from '@/lib/lang';
import { scrollToSectionId } from '@/lib/scrollToSectionId';
import { ContactButton } from './ContactButton';
import { CONTENT } from './content';

export function RestaurantsNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLang();
  const c = CONTENT[lang].nav;

  const toggleLang = () => {
    const next = lang === 'en' ? 'uk' : 'en';
    setLang(next);
    window.location.hash = next === 'uk' ? 'ua' : 'en';
  };

  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToSectionId(id);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 h-14 shadow-2xl relative">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          <a href="/" className="flex items-center gap-2 z-50 hover:opacity-80 transition-opacity shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-xs">
              ST
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Structio</span>
          </a>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-neutral-300">
            {c.links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <a
              href="/"
              className="text-xs font-bold text-neutral-400 hover:text-white border border-white/20 hover:border-white/50 rounded-md px-2.5 py-1.5 transition-colors whitespace-nowrap"
            >
              {c.home}
            </a>
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs font-bold text-neutral-400 hover:text-white border border-white/20 hover:border-white/50 rounded-md px-2.5 py-1.5 transition-colors"
            >
              {lang === 'en' ? 'UA' : 'EN'}
            </button>
            <ContactButton
              label={c.cta}
              className="bg-amber-500 text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          <div
            className={`absolute top-full left-0 w-full bg-neutral-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-6 ${menuOpen ? 'max-h-screen py-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
          >
            {c.links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-lg font-medium text-white hover:text-amber-400"
                onClick={(e) => scrollToSection(e, link.id)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/"
              className="text-lg font-medium text-neutral-400 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {c.home}
            </a>
            <ContactButton
              label={c.cta}
              onBeforeOpen={() => setMenuOpen(false)}
              className="bg-amber-500 text-black px-8 py-3 rounded-lg text-lg font-bold w-3/4 text-center"
            />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                toggleLang();
              }}
              className="text-sm font-bold text-neutral-400 hover:text-white border border-white/20 rounded-md px-4 py-2 transition-colors"
            >
              {lang === 'en' ? 'Перейти на UA' : 'Switch to EN'}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
