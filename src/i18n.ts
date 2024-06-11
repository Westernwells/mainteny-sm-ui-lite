import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import de from './languages/de.json';
import en from './languages/en.json';
import sr from './languages/sr.json';
import it from './languages/it.json';
import ru from './languages/ru.json';
import da from './languages/dk.json';
import ka from './languages/ka.json';
import es from './languages/es.json';
import gr from './languages/gr.json';
import tr from './languages/tr.json';

export const resources = {
  de: {
    translation: de,
  },
  en: {
    translation: en,
  },
  sr: {
    translation: sr,
  },
  it: {
    translation: it,
  },
  ru: {
    translation: ru,
  },
  da: {
    translation: da,
  },
  ka: {
    translation: ka,
  },
  es: {
    translation: es,
  },
  gr: {
    translation: gr,
  },
  tr: {
    translation: tr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    // lng: 'en',

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
