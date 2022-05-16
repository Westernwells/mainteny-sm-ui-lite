import {resources} from './i18n';

declare module 'react-i18next' {
  interface Resources {
    ns2: typeof resources['de'];
  }

  export function useTranslation(ns?: any, options?: any): any;
}
