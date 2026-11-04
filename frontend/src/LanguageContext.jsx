import React, { createContext, useContext, useEffect, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem('shms_language') || 'English'
  );

  useEffect(() => {
    localStorage.setItem('shms_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] ??
      translations.English[key] ??
      key;
  };

  const toggleLanguage = () => {
    setLanguage((current) =>
      current === 'English' ? 'Tagalog' : 'English'
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider'
    );
  }

  return context;
}