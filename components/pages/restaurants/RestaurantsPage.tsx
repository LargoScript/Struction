'use client';
import Image from 'next/image';
import { LangProvider, useLang } from '@/lib/lang';
import { ICONS } from '@/lib/icons';
import { CONTENT, type PageContent } from './content';
import { RestaurantsNavbar } from './RestaurantsNavbar';
import { ContactButton } from './ContactButton';
import { RestaurantsFAQ } from './RestaurantsFAQ';

// ─── Page root — provides lang context ───────────────────────────────────────

export default function RestaurantsPage() {
  return (
    <LangProvider>
      <RestaurantsContent />
    </LangProvider>
  );
}

// ─── Content shell — reads lang, passes typed content to every section ────────

function RestaurantsContent() {
  const { lang } = useLang();
  const c = CONTENT[lang] as PageContent;

  return (
    <main className="min-h-screen bg-black text-white">
      <RestaurantsNavbar />
      <HeroSection        c={c.hero} />
      <ProblemsSection    c={c.problems} />
      <CapabilitiesSection c={c.capabilities} />
      <GallerySection     c={c.gallery} />
      <StatsSection       stats={c.stats} />
      <RestaurantsFAQ />
      <CTASection         c={c.cta} />
      <SimpleFooter       c={c.footer} />
    </main>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ c }: { c: PageContent['hero'] }) {
  return (
    <header
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      <Image
        src="/images/lumiere-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover brightness-[0.28]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 55%)' }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
        <div className="mb-6 inline-block px-5 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-amber-300 text-[10px] font-bold tracking-[0.22em] uppercase">
          {c.badge}
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6 max-w-4xl">
          {c.h1a}<br />
          <span className="text-amber-400">{c.h1b}</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mb-10 font-light leading-relaxed">
          {c.sub}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ContactButton
            label={c.ctaPrimary}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-[0_0_24px_rgba(245,158,11,0.35)]"
          />
          <a
            href="https://lumiere-dining.vercel.app/home"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-bold backdrop-blur-md transition-all text-center"
          >
            {c.ctaDemo}
          </a>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 hidden sm:flex justify-center gap-16">
          {c.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{s.value}</div>
              <div className="text-sm text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black pointer-events-none" />
    </header>
  );
}

// ─── Problems — editorial numbered list ──────────────────────────────────────

const PROBLEM_ICONS = ['globe', 'calendar', 'mobile', 'chart'] as const;

function ProblemsSection({ c }: { c: PageContent['problems'] }) {
  return (
    <section id="problems" className="relative py-32 bg-black border-t border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">{c.heading}</h2>
          <p className="text-neutral-500 text-lg">{c.sub}</p>
        </div>

        <div>
          {c.items.map((item, idx) => {
            const Icon = ICONS[PROBLEM_ICONS[idx]];
            return (
              <div
                key={idx}
                className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[4rem_1fr_2rem] items-start gap-x-6 py-10 border-t border-white/[0.08]"
              >
                <span className="text-5xl sm:text-6xl font-black leading-none text-amber-500/[0.15] tabular-nums select-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed max-w-lg">{item.text}</p>
                </div>
                <div className="hidden sm:flex items-start pt-1 text-amber-400/25">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
          <div className="border-t border-white/[0.08]" />
        </div>
      </div>
    </section>
  );
}

// ─── Capabilities — split layout: feature list + image panel ─────────────────

const CAP_ICONS = ['star', 'calendar', 'mobile', 'globe', 'lightning', 'edit'] as const;

function CapabilitiesSection({ c }: { c: PageContent['capabilities'] }) {
  return (
    <section id="solution" className="relative py-32 bg-[#080808] border-t border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{c.heading}</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">{c.sub}</p>
        </div>

        <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/10 mb-4">
          {/* Feature list */}
          <div className="bg-zinc-900/70 p-10 flex flex-col gap-8">
            {c.items.slice(0, 4).map((s, i) => {
              const Icon = ICONS[CAP_ICONS[i]];
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{s.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image panel */}
          <div className="relative min-h-[320px] lg:min-h-0">
            <Image
              src="/images/lumiere-hero.jpg"
              alt="Lumière Dining — restaurant website example"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover brightness-[0.45]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-amber-400/70 text-[10px] font-bold tracking-widest uppercase mb-2">
                {c.imageLabel}
              </p>
              <a
                href="https://lumiere-dining.vercel.app/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-amber-400 transition-colors text-sm"
              >
                {c.imageCta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom 2 features */}
        <div className="grid sm:grid-cols-2 gap-4">
          {c.items.slice(4).map((s, i) => {
            const Icon = ICONS[CAP_ICONS[i + 4]];
            return (
              <div
                key={i}
                className="group flex items-start gap-4 p-8 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-amber-500/30 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function GallerySection({ c }: { c: PageContent['gallery'] }) {
  return (
    <section id="gallery" className="relative py-24 bg-black border-t border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{c.heading}</h2>
          <p className="text-neutral-500 mt-2 text-sm">{c.sub}</p>
        </div>

        <a
          href="https://lumiere-dining.vercel.app/home"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors bg-zinc-900/40"
        >
          <div className="relative w-full sm:w-[55%] aspect-video sm:aspect-auto sm:min-h-[320px] shrink-0">
            <Image
              src="/images/lumiere-hero.jpg"
              alt="Lumière Dining"
              fill
              sizes="(max-width: 640px) 100vw, 55vw"
              className="object-cover brightness-50 group-hover:brightness-[0.6] group-hover:scale-[1.02] transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/70 sm:block hidden" />
          </div>

          <div className="flex flex-col justify-center px-8 py-10 sm:py-12">
            <span className="text-amber-400/70 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              {c.demoLabel}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{c.project}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm">{c.projectDesc}</p>
            <span className="inline-flex items-center gap-2 text-amber-400 group-hover:text-amber-300 text-sm font-semibold transition-colors">
              {c.openLink}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsSection({ stats }: { stats: PageContent['stats'] }) {
  return (
    <section className="py-20 bg-[#080808] border-t border-b border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
          {stats.map((s, i) => (
            <div key={i} className="px-6 md:px-10 py-6 text-center">
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-1">{s.metric}</div>
              <div className="text-white text-sm font-medium mb-1">{s.label}</div>
              <div className="text-neutral-600 text-xs leading-snug hidden md:block">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection({ c }: { c: PageContent['cta'] }) {
  return (
    <section id="cta" className="relative py-32 overflow-hidden bg-black border-t border-white/[0.06]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.09) 0%, transparent 60%)' }}
      />
      <div className="relative container mx-auto px-4 text-center">
        <div className="mb-6 inline-block px-5 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-amber-300 text-[10px] font-bold tracking-[0.22em] uppercase">
          {c.badge}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
          {c.heading}
        </h2>
        <p className="text-neutral-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">{c.sub}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ContactButton
            label={c.primary}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-[0_0_24px_rgba(245,158,11,0.35)]"
          />
          <a
            href="https://t.me/StructioDev"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-bold backdrop-blur-md transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.11.4-.36-.01-1.06-.2-1.58-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            {c.telegram}
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function SimpleFooter({ c }: { c: PageContent['footer'] }) {
  return (
    <footer className="border-t border-white/10 bg-black py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center text-black font-bold text-[10px]">
            ST
          </div>
          <span>© {new Date().getFullYear()} Structio. {c.rights}</span>
        </div>
        <div className="flex gap-6">
          <a href="/" className="hover:text-neutral-400 transition-colors">{c.home}</a>
          <a href="https://t.me/StructioDev" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-400 transition-colors">
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}
