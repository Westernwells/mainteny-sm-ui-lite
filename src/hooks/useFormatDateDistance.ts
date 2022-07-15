import {formatDistance} from 'date-fns';

export const useFormatDateDistance =
  () =>
  (date: Date, baseDate: Date = new Date()) =>
    formatDistance(date, baseDate);
