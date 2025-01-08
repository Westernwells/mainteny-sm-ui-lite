import {useCallback} from 'react';
import {formatDate, locales} from 'utils/datetime';
import {mapLanguageToLocale} from 'utils/language';
import {useUserSession} from './reactQuery/useUserSession';

export const useFormatDate = () => {
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  return useCallback(
    (input?: string | Date, dateFormat?: string) =>
      formatDate(
        input,
        dateFormat || user?.userAccount.serviceCompany.settings.dateFormat,
        {
          locale: locales[locale],
        },
      ),
    [],
  );
};
