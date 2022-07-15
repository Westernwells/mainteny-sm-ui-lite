import {isToday, isTomorrow, isYesterday} from 'date-fns';
import {useFormatDate} from './useFormatDate';

export const useWhen = () => {
  const formatDate = useFormatDate();
  return (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    }

    if (isTomorrow(date)) {
      return 'Tomorrow';
    }

    if (isYesterday(date)) {
      return 'Yesterday';
    }

    return formatDate(date);
  };
};
