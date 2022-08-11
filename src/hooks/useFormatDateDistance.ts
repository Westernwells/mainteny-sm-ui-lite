import {formatDistance} from 'date-fns';
import {locales} from 'utils/datetime';
import {mapLanguageToLocale} from 'utils/utils';
import {useUserSession} from './reactQuery/useUserSession';

export const useFormatDateDistance = () => {
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  return (date: Date, baseDate: Date = new Date()) =>
    formatDistance(date, baseDate, {locale: locales[locale], addSuffix: true});
};
