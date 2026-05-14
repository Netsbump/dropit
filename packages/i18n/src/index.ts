import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAthletes from './locales/en/athletes.json';
import en from './locales/en/common.json';
import enPlanning from './locales/en/planning.json';
import enOnboarding from './locales/en/onboarding.json';
import enAuth from './locales/en/auth.json';
import enAdmin from './locales/en/admin.json';
import enExercise from './locales/en/exercise.json';
import enProfile from './locales/en/profile.json';
import enPrivacy from './locales/en/privacy.json';
import enWorkout from './locales/en/workout.json';
import enComplex from './locales/en/complex.json';
import enHelp from './locales/en/help.json';
import enDashboard from './locales/en/dashboard.json';
import enOrganization from './locales/en/organization.json';
import enLibrary from './locales/en/library.json';
import frAthletes from './locales/fr/athletes.json';
import fr from './locales/fr/common.json';
import frPlanning from './locales/fr/planning.json';
import frAuth from './locales/fr/auth.json';
import frAdmin from './locales/fr/admin.json';
import frExercise from './locales/fr/exercise.json';
import frOnboarding from './locales/fr/onboarding.json';
import frProfile from './locales/fr/profile.json';
import frPrivacy from './locales/fr/privacy.json';
import frWorkout from './locales/fr/workout.json';
import frComplex from './locales/fr/complex.json';
import frHelp from './locales/fr/help.json';
import frDashboard from './locales/fr/dashboard.json';
import frOrganization from './locales/fr/organization.json';
import frLibrary from './locales/fr/library.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: en,
    athletes: enAthletes,
    planning: enPlanning,
    auth: enAuth,
    admin: enAdmin,
    exercise: enExercise,
    onboarding: enOnboarding,
    profile: enProfile,
    privacy: enPrivacy,
    workout: enWorkout,
    complex: enComplex,
    help: enHelp,
    dashboard: enDashboard,
    organization: enOrganization,
    library: enLibrary,
  },
  fr: {
    common: fr,
    athletes: frAthletes,
    planning: frPlanning,
    auth: frAuth,
    admin: frAdmin,
    exercise: frExercise,
    onboarding: frOnboarding,
    profile: frProfile,
    privacy: frPrivacy,
    workout: frWorkout,
    complex: frComplex,
    help: frHelp,
    dashboard: frDashboard,
    organization: frOrganization,
    library: frLibrary,
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
