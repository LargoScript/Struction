'use client';
import { useLang } from '@/lib/lang';
import { ContactButton } from './ContactButton';
import { CONTENT } from './content';

export function RestaurantsNavbar() {
  const { lang, setLang } = useLang();
  const c = CONTENT[lang].nav;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 h-14 shadow-2xl">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-xs">
              ST
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Structio</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:block text-xs font-bold text-neutral-400 hover:text-white border border-white/20 hover:border-white/50 rounded-md px-2.5 py-1.5 transition-colors"
            >
              {c.home}
            </a>
            {/* Language toggle — same style as main site Navbar */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'uk' : 'en')}
              className="text-xs font-bold text-neutral-400 hover:text-white border border-white/20 hover:border-white/50 rounded-md px-2.5 py-1.5 transition-colors"
            >
              {lang === 'en' ? 'UA' : 'EN'}
            </button>
            <ContactButton
              label={c.cta}
              className="bg-amber-500 text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors"
            />
          </div>

        </div>
      </div>
    </nav>
  );
}
