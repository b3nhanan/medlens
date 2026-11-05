import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, I18N_DICT, Translations } from '../i18n.ts';

interface SettingsContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  largeText: boolean;
  setLargeText: (enabled: boolean) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  readingLevel: 'simple' | 'detailed';
  setReadingLevel: (level: 'simple' | 'detailed') => void;
  t: Translations;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('medlens_lang') as SupportedLanguage) || 'en';
  });

  const [largeText, setLargeTextState] = useState<boolean>(() => {
    return localStorage.getItem('medlens_large_text') === 'true';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('medlens_high_contrast') === 'true';
  });

  const [readingLevel, setReadingLevelState] = useState<'simple' | 'detailed'>(() => {
    return (localStorage.getItem('medlens_reading_level') as any) || 'simple';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync class on documentElement for large-text
  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    localStorage.setItem('medlens_large_text', String(largeText));
  }, [largeText]);

  // Sync class on documentElement for high-contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('medlens_high_contrast', String(highContrast));
  }, [highContrast]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('medlens_lang', lang);
  };

  const setLargeText = (val: boolean) => {
    setLargeTextState(val);
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
  };

  const setReadingLevel = (lvl: 'simple' | 'detailed') => {
    setReadingLevelState(lvl);
    localStorage.setItem('medlens_reading_level', lvl);
  };

  const t = I18N_DICT[language] || I18N_DICT.en;

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        largeText,
        setLargeText,
        highContrast,
        setHighContrast,
        readingLevel,
        setReadingLevel,
        t,
        isSettingsOpen,
        setIsSettingsOpen
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
