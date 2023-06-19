import {formatDistance} from 'date-fns';
import {srLatn} from 'date-fns/locale';
import {locales} from 'utils/datetime';
import {mapLanguageToLocale} from 'utils/utils';
import {useUserSession} from './reactQuery/useUserSession';

export const useFormatDateDistance = () => {
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  return (date: Date, baseDate: Date = new Date(), options: any = {}) =>
    formatDistance(date, baseDate, {
      locale: locales[locale] || srLatn,
      addSuffix: true,
      ...options,
    });
};
