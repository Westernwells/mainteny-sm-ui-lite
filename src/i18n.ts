import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {de} from './languages/de/de';

export const resources = {
  de: {
    translation: de,
  },
  en: {
    translation: {},
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en-US',
    // lng: 'en',

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

i18n.languages = ['de-DE', 'de', 'es', 'fr', 'en-US', 'dev'];

export default i18n;
