import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';
import fr from './locales/fr/common.json';
import enAthletes from './locales/en/athletes.json';
import frAthletes from './locales/fr/athletes.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: en,
    athletes: enAthletes,
  },
  fr: {
    common: fr,
    athletes: frAthletes,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    resources,
    lng: 'fr', // langue par défaut
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement
    },
  });

//i18n.changeLanguage('en');

// Re-export hooks and utilities that components will need
export { useTranslation } from 'react-i18next';
export default i18n; 