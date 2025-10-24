import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAthletes from './locales/en/athletes.json';
import en from './locales/en/common.json';
import enPlanning from './locales/en/planning.json';
import enOnboarding from './locales/en/onboarding.json';
import enAuth from './locales/en/auth.json';
import enProfile from './locales/en/profile.json';
import enPrivacy from './locales/en/privacy.json';
import frAthletes from './locales/fr/athletes.json';
import fr from './locales/fr/common.json';
import frPlanning from './locales/fr/planning.json';
import frAuth from './locales/fr/auth.json';
import frOnboarding from './locales/fr/onboarding.json';
import frProfile from './locales/fr/profile.json';
import frPrivacy from './locales/fr/privacy.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: en,
    athletes: enAthletes,
    planning: enPlanning,
    auth: enAuth,
    onboarding: enOnboarding,
    profile: enProfile,
    privacy: enPrivacy,
  },
  fr: {
    common: fr,
    athletes: frAthletes,
    planning: frPlanning,
    auth: frAuth,
    onboarding: frOnboarding,
    profile: frProfile,
    privacy: frPrivacy,
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
