import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Lang } from '../i18n/translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const DEFAULT_LANG: Lang = 'en';

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key: string) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {}
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem('language', l); } catch {}
  }

  function t(key: string): string {
    return translations[lang][key] || key;
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
