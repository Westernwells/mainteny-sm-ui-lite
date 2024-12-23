// Some language first character set is being duplicated with other languages
import {Language} from 'models/misc';

export const mapExceptionLanguage = (language: string) => {
  if (language === 'it-lt') return 'LT';
};

export const languageMap: {[key: string]: string} = {
  'en-US': 'en-us',
  'de-DE': 'de-de',
  'sr-SP': 'sr-sp',
  'it-IT': 'it-it',
  'it-LT': 'it-lt',
  'ru-RU': 'ru-ru',
  'da-DK': 'da-dk',
  'ka-GE': 'ka-ge',
  'es-ES': 'es-es',
  'gr-GR': 'gr-gr',
  'tr-TR': 'tr-tr',
};

export const mapLanguageToLocale: {[key: string]: string} = {
  'en-us': 'enUS',
  'de-de': 'de',
  'sr-SP': 'sr',
  'it-it': 'it',
  'it-lt': 'lt',
  'ru-ru': 'ru',
  'da-DK': 'da',
  'ka-GE': 'ka',
  'es-ES': 'es',
  'gr-GR': 'gr',
  'tr-TR': 'tr',
};
export const languagesToPars: {[key: string]: string} = {
  KA: 'GE',
};

export const languageContextMap: {[key: string]: Language} = {
  EN: Language.EN_US,
  DE: Language.DE_DE,
  SR: Language.SR_RS,
  RU: Language.RU_RU,
  IT: Language.IT_IT,
  LT: Language.IT_LT,
  DA: Language.DA_DK,
  KA: Language.KA_GE,
  ES: Language.ES_ES,
  GR: Language.GR_GR,
  TR: Language.TR_TR,
};

export const companyLanguageContextMap: {[key: string]: string} = {
  'de-de': 'de',
  'en-us': 'en',
  'sr-rs': 'sr',
  'it-it': 'it',
  'it-lt': 'lt',
  'ru-ru': 'ru',
  'da-dk': 'da',
  'ka-ge': 'ka',
  'es-es': 'es',
  'gr-gr': 'gr',
  'tr-tr': 'tr',
};

export const companyLanguageToUppercaseMap: {[key: string]: string} = {
  'de-de': Language.DE_DE,
  'en-us': Language.EN_US,
  'sr-rs': Language.SR_RS,
  'it-it': Language.IT_IT,
  'it-lt': Language.IT_LT,
  'ru-ru': Language.RU_RU,
  'ka-ge': Language.KA_GE,
  'es-es': Language.ES_ES,
  'gr-gr': Language.GR_GR,
  'tr-tr': Language.TR_TR,
};

export const convertLanguageIfNeeded = (key: string) =>
  languagesToPars[key] || key;
