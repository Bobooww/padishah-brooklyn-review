'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { COPY, type Lang, type CopyBundle } from '@/content/copy';

type Ctx = { lang: Lang; t: CopyBundle; setLang: (l: Lang) => void };

const LangCtx = createContext<Ctx>({ lang: 'en', t: COPY.en, setLang: () => undefined });

export const useLang = () => useContext(LangCtx);

const KEY = 'padishah.lang';

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === 'ru' || stored === 'en') {
      setLangState(stored);
      return;
    }
    // A Russian-speaking neighbourhood: honour the browser, but never guess further.
    if (navigator.language?.toLowerCase().startsWith('ru')) setLangState('ru');
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
  }, []);

  const value = useMemo(() => ({ lang, t: COPY[lang] as CopyBundle, setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={`langtoggle ${className}`} role="group" aria-label={t.footer.langLabel}>
      {(['en', 'ru'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className="langtoggle__btn"
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
