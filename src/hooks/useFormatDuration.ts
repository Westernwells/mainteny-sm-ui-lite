import {formatDuration, Locale} from 'date-fns';
import {useCallback} from 'react';
import {locales} from 'utils/datetime';
import {mapLanguageToLocale} from 'utils/utils';
import {useUserSession} from './reactQuery/useUserSession';

export interface DateDuration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface DateDurationOptions {
  format?: string[];
  zero?: boolean;
  delimiter?: string;
  locale?: Locale;
}

export const useFormatDuration = () => {
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  const defaultDuration = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  return useCallback(
    (
      // eslint-disable-next-line default-param-last
      input: DateDuration = defaultDuration,
      dateFormat?: string,
      options?: DateDurationOptions,
    ) =>
      formatDuration(
        {...defaultDuration, ...input},
        {
          locale: locales[locale],
          ...options,
        },
      ),
    [],
  );
};
