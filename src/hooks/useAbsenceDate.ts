import {getDifferenceInInterval} from 'utils/datetime';
import {useFormatDate} from './useFormatDate';

export const useAbsencedate = () => {
  const formatDate = useFormatDate();
  return (startDate: Date, endDate: Date) => {
    const numberOfDays = getDifferenceInInterval(startDate, endDate);

    if (numberOfDays?.days === 0) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
};
