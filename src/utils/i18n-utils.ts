import {TOptions, t} from 'i18next';
import {ReactNode} from 'react';

export const T = (key: string, options?: TOptions) =>
  t(key, options) as ReactNode;
export const i18n = {
  T,
};
