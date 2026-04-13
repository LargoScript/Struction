"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Lang = 'en' | 'uk';

const LANG_STORAGE_KEY = 'struction_lang';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({ lang: 'en', setLang: () => {} });

function getHashLang(): Lang | null {
  const hash = window.location.hash.toLowerCase().replace('#', '');
  if (hash === 'ua' || hash === 'uk') return 'uk';
  if (hash === 'en') return 'en';
  return null;
}

function getStoredLang(): Lang | null {
  try {
    const val = localStorage.getItem(LANG_STORAGE_KEY);
    if (val === 'uk' || val === 'en') return val;
  } catch {}
  return null;
}

export const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('en');

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_STORAGE_KEY, l); } catch {}
  }, []);

  // On mount: hash → localStorage → IP → 'en'
  useEffect(() => {
    const hashLang = getHashLang();
    if (hashLang) { setLang(hashLang); return; }

    const stored = getStoredLang();
    if (stored) { setLangState(stored); return; }

    fetch('/api/lang')
      .then(r => r.json())
      .then(({ lang: detected }: { lang: Lang }) => {
        if (detected === 'uk' || detected === 'en') setLang(detected);
      })
      .catch(() => {});
  }, []);

  // React to hash changes (e.g. user navigates to #ua or #en)
  useEffect(() => {
    const onHashChange = () => {
      const hashLang = getHashLang();
      if (hashLang) setLang(hashLang);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [setLang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
};

export function useLang(): LangContextType {
  return useContext(LangContext);
}
