"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { IconKey } from '../icons';
import { setByPath } from '../struction-cms/contentPath';
import { useLang, type Lang } from '../lang';
export type { Lang } from '../lang';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroContent {
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  videoSrc: string;
  poster: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  desc: string;
  iconKey: IconKey;
}

export interface FeaturesSection {
  heading: string;
  subheading: string;
  cards: FeatureCard[];
}

export interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  year: string;
  url?: string;
}

export interface PortfolioSection {
  heading: string;
  subheading: string;
  items: PortfolioItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  heading: string;
  subheading: string;
  items: FaqItem[];
}

export interface FooterContent {
  tagline: string;
  email: string;
  phone: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialBehance: string;
}

export interface SiteContent {
  hero: HeroContent;
  features: FeaturesSection;
  portfolio: PortfolioSection;
  faq: FaqSection;
  footer: FooterContent;
}


// ─── Default content ──────────────────────────────────────────────────────────

// Base URL for static assets
const BASE = '/';

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'lumiere',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=2070',
    title: 'Lumière Dining',
    category: 'Restaurant • Fine Dining',
    year: '2025',
    url: 'https://lumiere-dining.vercel.app',
  },
  {
    id: 'novadent',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070',
    title: 'NovaDent',
    category: 'Dental Clinic • Landing Page',
    year: '2025',
    url: 'https://novadent-nine.vercel.app',
  },
];

export const defaultContentEn: SiteContent = {
  hero: {
    badge: 'Web Development for Small Business',
    titleLine1: 'We build websites that',
    titleHighlight: 'drive real results',
    description: 'Struction helps local businesses establish a powerful online presence. Modern design, SEO optimization, and easy management — everything you need to grow.',
    primaryButton: 'Book a Free Consultation',
    secondaryButton: 'View Our Work',
    videoSrc: `${BASE}videos/hero.mp4`,
    poster: `${BASE}images/hero-poster.jpg`,
  },
  features: {
    heading: 'Why businesses choose us',
    subheading: 'We understand what small businesses need: fast delivery, quality results, and fair pricing.',
    cards: [
      { id: '1', title: 'Local SEO', desc: 'We optimize your website so customers in your area find you first on Google.', iconKey: 'location' },
      { id: '2', title: 'Responsive Design', desc: 'Your site looks perfect on every device — from an old iPhone to a wide-screen monitor.', iconKey: 'mobile' },
      { id: '3', title: 'Fast Loading', desc: "Nobody waits. We optimize code and images to make your site lightning fast.", iconKey: 'lightning' },
      { id: '4', title: 'Easy Management', desc: 'Update prices, add photos, and edit content yourself — no developer needed.', iconKey: 'edit' },
      { id: '5', title: 'Online Booking', desc: 'Integrate booking forms and CRM so you never miss a potential client.', iconKey: 'calendar' },
      { id: '6', title: 'Ongoing Support', desc: "We don't disappear after launch. We keep your site running smoothly 24/7.", iconKey: 'support' },
    ],
  },
  portfolio: {
    heading: 'Our Work',
    subheading: 'Real projects. Real results for real businesses.',
    items: PORTFOLIO_ITEMS,
  },
  faq: {
    heading: 'Frequently Asked Questions',
    subheading: 'Everything you need to know about working with us.',
    items: [
      { id: '1', question: 'How long does it take to build a website?', answer: 'A landing page typically takes 5–10 business days. Multi-page sites and e-commerce projects take 3–5 weeks depending on complexity.' },
      { id: '2', question: 'Do you provide support after launch?', answer: 'Yes! We include 1 month of free technical support after launch. Ongoing support packages are also available.' },
      { id: '3', question: 'How much does a website cost?', answer: 'Pricing is calculated individually. Landing pages start from $500, corporate websites from $1,200. Contact us for a detailed quote.' },
      { id: '4', question: 'Can I edit the site myself?', answer: 'Absolutely. We connect a user-friendly CMS so you can update text, photos, and news without any coding knowledge.' },
      { id: '5', question: 'How do we get started?', answer: "Just reach out with a brief idea. We'll help define the scope, suggest references, and propose the best solution for your budget." },
    ],
  },
  footer: {
    tagline: 'Building fast, modern websites for businesses that want to grow. Based in Kyiv, working worldwide.',
    email: 'struction.dev@gmail.com',
    phone: '+380 75 973 92 85',
    socialInstagram: '#',
    socialTwitter: '#',
    socialLinkedin: '#',
    socialBehance: '#',
  },
};

export const defaultContentUk: SiteContent = {
  hero: {
    badge: 'Розробка сайтів для малого бізнесу',
    titleLine1: 'Ми створюємо сайти, які',
    titleHighlight: 'дають реальні результати',
    description: 'Struction допомагає місцевому бізнесу здобути потужну присутність в інтернеті. Сучасний дизайн, SEO-оптимізація та зручне управління — все необхідне для зростання.',
    primaryButton: 'Безкоштовна консультація',
    secondaryButton: 'Наші роботи',
    videoSrc: `${BASE}videos/hero.mp4`,
    poster: `${BASE}images/hero-poster.jpg`,
  },
  features: {
    heading: 'Чому бізнес обирає нас',
    subheading: 'Ми розуміємо потреби малого бізнесу: швидко, якісно і за справедливою ціною.',
    cards: [
      { id: '1', title: 'Локальне SEO', desc: 'Оптимізуємо сайт так, щоб клієнти у вашому місті знаходили вас першими в Google.', iconKey: 'location' },
      { id: '2', title: 'Адаптивний дизайн', desc: 'Сайт ідеально виглядає на будь-якому пристрої — від старого iPhone до широкоекранного монітора.', iconKey: 'mobile' },
      { id: '3', title: 'Швидке завантаження', desc: 'Ніхто не чекає. Оптимізуємо код і зображення, щоб сайт летів.', iconKey: 'lightning' },
      { id: '4', title: 'Легке управління', desc: 'Оновлюйте ціни, додавайте фото і редагуйте контент самостійно — без програміста.', iconKey: 'edit' },
      { id: '5', title: 'Онлайн-бронювання', desc: 'Інтегруємо форми запису та CRM, щоб ви не втрачали жодного клієнта.', iconKey: 'calendar' },
      { id: '6', title: 'Постійна підтримка', desc: 'Ми не зникаємо після запуску. Тримаємо ваш сайт у робочому стані 24/7.', iconKey: 'support' },
    ],
  },
  portfolio: {
    heading: 'Наші роботи',
    subheading: 'Реальні проекти. Реальні результати для реального бізнесу.',
    items: PORTFOLIO_ITEMS,
  },
  faq: {
    heading: 'Часті запитання',
    subheading: 'Все, що вам потрібно знати про співпрацю з нами.',
    items: [
      { id: '1', question: 'Скільки часу займає розробка?', answer: 'Лендінг — зазвичай 5–10 робочих днів. Багатосторінкові сайти та інтернет-магазини — 3–5 тижнів залежно від складності.' },
      { id: '2', question: 'Чи є підтримка після запуску?', answer: 'Так! Після запуску ми надаємо 1 місяць безкоштовної технічної підтримки. Також доступні пакети постійної підтримки.' },
      { id: '3', question: 'Скільки коштує сайт?', answer: 'Ціна розраховується індивідуально. Лендінги від $500, корпоративні сайти від $1200. Напишіть нам для детального розрахунку.' },
      { id: '4', question: 'Чи зможу я редагувати сайт самостійно?', answer: 'Звісно. Ми підключимо зручну CMS, щоб ви могли оновлювати тексти, фото і новини без знань програмування.' },
      { id: '5', question: 'Як розпочати співпрацю?', answer: 'Просто напишіть нам із коротким описом ідеї. Ми допоможемо визначити обсяг, запропонуємо референси і підберемо оптимальне рішення для вашого бюджету.' },
    ],
  },
  footer: {
    tagline: 'Створюємо швидкі, сучасні сайти для бізнесу, який прагне зростати. Базуємося в Києві, працюємо по всьому світу.',
    email: 'struction.dev@gmail.com',
    phone: '+380 75 973 92 85',
    socialInstagram: '#',
    socialTwitter: '#',
    socialLinkedin: '#',
    socialBehance: '#',
  },
};

const DEFAULTS: Record<Lang, SiteContent> = { en: defaultContentEn, uk: defaultContentUk };

// ─── Storage helpers ──────────────────────────────────────────────────────────

// instanceId scopes content to a specific section instance (e.g. "faq-2").
// When omitted the global per-language key is used (backward-compatible).
const STORAGE_KEY = (lang: Lang, instanceId?: string) =>
  instanceId ? `struction_content_${instanceId}` : `struction_content_${lang}`;

export function loadContent(lang: Lang, instanceId?: string): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(lang, instanceId));
    if (raw) return { ...DEFAULTS[lang], ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS[lang];
}

function saveContent(lang: Lang, c: SiteContent, instanceId?: string) {
  try {
    localStorage.setItem(STORAGE_KEY(lang, instanceId), JSON.stringify(c));
    // Broadcast to preview iframes — skip when we ARE the preview
    if (!new URLSearchParams(window.location.search).has('preview')) {
      const bc = new BroadcastChannel('cms_sync');
      bc.postMessage('content');
      bc.close();
    }
  } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContentContextType {
  activeContent: SiteContent;
  activeLang: Lang;
  setLang: (lang: Lang) => void;
  updateHero: (patch: Partial<HeroContent>) => void;
  setFeatures: (patch: Partial<FeaturesSection>) => void;
  setPortfolio: (patch: Partial<PortfolioSection>) => void;
  setFaq: (patch: Partial<FaqSection>) => void;
  /** Generic dot-path updater used by the CMS framework (CMSContentEditor) */
  updateContent: (path: string, value: any) => void;
  reset: () => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider: React.FC<{ children: ReactNode; instanceId?: string }> = ({ children, instanceId }) => {
  const { lang: activeLang, setLang } = useLang();
  const [allContent, setAllContent] = useState<Record<Lang, SiteContent>>({
    en: loadContent('en', instanceId),
    uk: loadContent('uk', instanceId),
  });

  const activeContent = allContent[activeLang];

  const updateHero = useCallback((patch: Partial<HeroContent>) => {
    setAllContent(prev => {
      const next = { ...prev, [activeLang]: { ...prev[activeLang], hero: { ...prev[activeLang].hero, ...patch } } };
      saveContent(activeLang, next[activeLang], instanceId);
      return next;
    });
  }, [activeLang, instanceId]);

  const setFeatures = useCallback((patch: Partial<FeaturesSection>) => {
    setAllContent(prev => {
      const next = { ...prev, [activeLang]: { ...prev[activeLang], features: { ...prev[activeLang].features, ...patch } } };
      saveContent(activeLang, next[activeLang], instanceId);
      return next;
    });
  }, [activeLang, instanceId]);

  const setPortfolio = useCallback((patch: Partial<PortfolioSection>) => {
    setAllContent(prev => {
      const next = { ...prev, [activeLang]: { ...prev[activeLang], portfolio: { ...prev[activeLang].portfolio, ...patch } } };
      saveContent(activeLang, next[activeLang], instanceId);
      return next;
    });
  }, [activeLang, instanceId]);

  const setFaq = useCallback((patch: Partial<FaqSection>) => {
    setAllContent(prev => {
      const next = { ...prev, [activeLang]: { ...prev[activeLang], faq: { ...prev[activeLang].faq, ...patch } } };
      saveContent(activeLang, next[activeLang], instanceId);
      return next;
    });
  }, [activeLang, instanceId]);

  const updateContent = useCallback((path: string, value: any) => {
    setAllContent(prev => {
      const next = { ...prev, [activeLang]: setByPath(prev[activeLang], path, value) as SiteContent };
      saveContent(activeLang, next[activeLang], instanceId);
      return next;
    });
  }, [activeLang, instanceId]);

  const reset = useCallback(() => {
    const next: Record<Lang, SiteContent> = { en: DEFAULTS.en, uk: DEFAULTS.uk };
    setAllContent(next);
    saveContent('en', DEFAULTS.en, instanceId);
    saveContent('uk', DEFAULTS.uk, instanceId);
  }, [instanceId]);

  // In preview mode: reload content whenever the CMS writes to localStorage
  // (storage event fires automatically in other documents on the same origin)
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('preview')) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('struction_content') || e.key === null) {
        setAllContent({
          en: loadContent('en', instanceId),
          uk: loadContent('uk', instanceId),
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [instanceId]);

  return (
    <ContentContext.Provider value={{ activeContent, activeLang, setLang, updateHero, setFeatures, setPortfolio, setFaq, updateContent, reset }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
};

