import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '../../languages/en.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: false, // we do not use keys in form messages.welcome

  // have a common namespace used around the full app
  ns: ['translationsNS'],
  defaultNS: 'translationsNS',

  debug: true,

  interpolation: {
    escapeValue: false, // not needed for react!!
  },

  resources: {
    en: {
      translation: en,
    },
  },
});

export default i18n;
