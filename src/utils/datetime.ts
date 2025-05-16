import {
  addDays,
  differenceInDays,
  endOfWeek,
  format,
  formatDistance,
  formatDistanceToNowStrict,
  intervalToDuration,
  isAfter,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  Locale,
  parseISO,
  set,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {de, enUS, srLatn} from 'date-fns/locale';
import * as datePickerLocales from '@mui/x-date-pickers/locales';
import {companyLanguageToUppercaseMap} from 'utils/language';
import {TimeWindowType} from 'models/employee';
import {Language} from '../models/misc';

export const DEFAULT_DATE_FORMAT = 'dd.MM.yyyy';
export const locales: {[key: string]: Locale} = {enUS, de, srLatn};

interface DateFormatOptions {
  locale?: globalThis.Locale | undefined;
  weekStartsOn?: 0 | 1 | 3 | 2 | 4 | 5 | 6 | undefined;
  firstWeekContainsDate?: number | undefined;
  useAdditionalWeekYearTokens?: boolean | undefined;
  useAdditionalDayOfYearTokens?: boolean | undefined;
}

export const WEEK_DAYS_ARRAY = [
  TimeWindowType.MONDAY,
  TimeWindowType.TUESDAY,
  TimeWindowType.WEDNESDAY,
  TimeWindowType.THURSDAY,
  TimeWindowType.FRIDAY,
  TimeWindowType.SATURDAY,
  TimeWindowType.SUNDAY,
];

export const WEEK_DAYS_WITHOUT_WEEKENDS = [
  TimeWindowType.MONDAY,
  TimeWindowType.TUESDAY,
  TimeWindowType.WEDNESDAY,
  TimeWindowType.THURSDAY,
  TimeWindowType.FRIDAY,
];

export const WEEKEND_DAYS = [TimeWindowType.SATURDAY, TimeWindowType.SUNDAY];

export function getDateObject(input: any): Date {
  const type = typeof input;
  if (type === 'string') {
    return parseISO(input);
  }

  if (type === 'number') {
    return new Date(input);
  }

  return <Date>input;
}

export const getStartOfWeek = (
  date: Date,
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
) => startOfWeek(date, {weekStartsOn: weekStart});

export const getEndOfWeek = (
  date: Date,
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
) => endOfWeek(date, {weekStartsOn: weekStart});

export function formatDate(
  input?: string | Date,
  formatType?: string,
  options?: DateFormatOptions,
) {
  if (!input) {
    return undefined;
  }

  return formatType
    ? format(getDateObject(input), formatType, options)
    : format(getDateObject(input), DEFAULT_DATE_FORMAT, options);
}

export function setDateTime(date: Date, hourMinute: string): Date {
  const parts = hourMinute.split(':');
  return new Date(
    date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0),
  );
}

export function toRestDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toRestDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function toTimeString(restDateTime: string): string {
  return format(parseISO(restDateTime), 'HH:mm');
}

export function toDate(value: any): Date {
  if (typeof value === 'number') {
    // value is epoch seconds
    return new Date(Math.trunc(value * 1000));
  }

  if (Array.isArray(value)) {
    return new Date(value[0], value[1] - 1, value[2], 0, 0, 0, 0);
  }

  return parseISO(value);
}

export function toEpochSeconds(date: Date): number {
  return date.getTime() / 1000;
}

export function timeToMinutes(time: string): number {
  const parts = time.split(':');
  const hour = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hour * 60 + minutes;
}

export const getWhen = (date: Date, formatStr: string) => {
  if (isToday(date)) {
    return 'Today';
  }

  if (isTomorrow(date)) {
    return 'Tomorrow';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return formatDate(date, formatStr);
};

export const convertMinsToHM = (minutes: number, padStart: number = 1) => {
  const m = Math.floor(minutes % 60).toString();
  const h = Math.floor(minutes / 60).toString();
  return `${h.padStart(padStart, '0')}h ${Number(m) > 0 ? `${m}m` : ''}`;
};

export const convertDigitalMinsToHM = (minutes: number) => {
  const m = Math.floor(minutes % 60).toString();
  const h = Math.floor(minutes / 60).toString();
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
};

export const convertHMToMins = (time: string) => {
  const parts = time.split(':');
  const hour = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hour * 60 + minutes;
};

export const getLastWeek = () => {
  const date = new Date();
  return new Date(date.setDate(date.getDate() - 7));
};

export const getRangeDate = (
  start: string,
  end: string,
  formatStr?: string,
) => {
  const dateStart = formatDate(start, formatStr);
  const dateEnd = formatDate(end, formatStr);
  return `${dateStart} - ${dateEnd}`;
};

export const convert12hTo24h = (time: string, meridian?: string) => {
  const localMeridian = meridian || time.split(' ')[1];
  const hr = time.split(':')[0];
  const min = time.split(':')[1];
  if (localMeridian) {
    const newHr =
      localMeridian.toUpperCase() === 'PM' && Number(hr) !== 12
        ? Number(hr) + 12
        : hr;
    return `${newHr}:${min.split(' ')[0]}`;
  }
  return `${hr}:${min}`;
};

export const convert24hTo12h = (time: string, addMeridian?: boolean) => {
  const hr = time.split(':')[0];
  const min = time.split(':')[1];

  const newHr = Number(hr) > 12 ? Number(hr) - 12 : hr;

  return addMeridian
    ? `${newHr.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:${min} ${Number(hr) >= 12 ? 'PM' : 'AM'}`
    : `${newHr.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:${min}`;
};

export const get24Hour = (startNumber?: number, endNumber?: number) =>
  [...Array(24).keys()]
    .map((i) => (i + 1).toString().padStart(2, '0'))
    .slice(startNumber ? startNumber - 1 : 0, endNumber || 24);

export const get12Hour = (startNumber?: number, endNumber?: number) =>
  [...Array(12).keys()]
    .map((i) => (i + 1).toString().padStart(2, '0'))
    .slice(startNumber ? startNumber - 1 : 0, endNumber || 12);

export const get60Mins = (startNumber?: number, endNumber?: number) =>
  [...Array(60).keys()]
    .map((i) => (i + 1).toString().padStart(2, '0'))
    .slice(startNumber ? startNumber - 1 : 0, endNumber || 60);

export const timeToNow = (value: string): string =>
  formatDistanceToNowStrict(toDate(value), {
    addSuffix: true,
  });

export const formatTimestamp = (date: Date, formatStr: string) => {
  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isAfter(date, subWeeks(new Date(), 1))) {
    return 'Last Week';
  }

  return formatDate(date, formatStr);
};

export const getDifferenceInInterval = (start: Date, end: Date) =>
  intervalToDuration({start: new Date(start), end: new Date(end)});

export const formatDueDate = (date: string | number | Date) => {
  const {t} = useTranslation();

  const formattedDate: string = formatDistance(new Date(date), new Date());

  const splitDate: string[] = formattedDate.split(' ');

  if (splitDate[0] === 'about') {
    const finalDate: string = t(`{{hours}} ${splitDate[2]}`, {
      hours: splitDate[1],
    });
    return `${t('Due in')} ${finalDate}`;
  }

  const finalDate: string = t(`{{time}} ${splitDate[1]}`, {
    time: splitDate[0],
  });
  return `${t('Due in')} ${finalDate}`;
};

export const isDateInPast = (date: Date | string): boolean => {
  const currentDate = new Date();
  const providedDate = new Date(date);

  providedDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  return providedDate < currentDate;
};

export const getDatesInRange = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  return dates;
};

export const getDatePickerLocale = (language?: Language) => {
  if (!language) return datePickerLocales.enUS;
  switch (companyLanguageToUppercaseMap[language]) {
    case Language.DE_DE:
      return datePickerLocales.deDE;
    case Language.IT_IT:
      return datePickerLocales.itIT;
    case Language.RU_RU:
      return datePickerLocales.ruRU;
    case Language.ES_ES:
      return datePickerLocales.esES;
    case Language.TR_TR:
      return datePickerLocales.trTR;
    default:
      return datePickerLocales.enUS;
  }
};

export const fromDateStringToDate = (
  dateString: string,
  companyDateFormat?: string,
) => {
  if (companyDateFormat === 'dd/MM/yyyy') {
    const [day, month, year] = dateString.split('/').map(Number);

    return new Date(year, month - 1, day); // Month is 0-indexed
  }

  if (companyDateFormat === 'dd.MM.yyyy') {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed
  }

  return new Date(dateString);
};

export const toRestDateTimeFormat = (date: Date) =>
  format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");

/**
 * Converts a time representation to the starting Date object with the given time
 * @param value A string time stamp in the format HH:mm
 * @return The corresponding Date object with the default date and updated time fields
 */
export const parseTimeFromHoursMinutesToDate = (value: string) =>
  new Date(
    0,
    0,
    0,
    parseInt(value.split(':')[0] ?? '0', 10),
    parseInt(value.split(':')[1] ?? '0', 10),
  );

export const getFirstDayOfMonthInFuture = (monthNumber: number): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Adjust to 0-based index for JavaScript Date
  const targetMonth = monthNumber - 1;

  const targetDateThisYear = set(new Date(), {
    year: currentYear,
    month: targetMonth,
    date: 1,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const finalDate =
    targetDateThisYear > now
      ? targetDateThisYear
      : set(targetDateThisYear, {year: currentYear + 1});

  return startOfMonth(finalDate);
};

export const getMonthNumberFromDate = (date?: Date | null) => {
  if (!date) return undefined;

  return date.getMonth() + 1;
};

export const getPastDateRange = (dateFrom?: string, dateTo?: string) => {
  if (!dateFrom || !dateTo) return {pastFrom: undefined, pastTo: undefined};

  const from = parseISO(dateFrom);
  const to = parseISO(dateTo);

  if (!isValid(from) || !isValid(to))
    return {pastFrom: undefined, pastTo: undefined};

  const diff = differenceInDays(to, from);
  const pastTo = subDays(from, 1);
  const pastFrom = subDays(pastTo, diff);

  return {
    pastFrom: format(pastFrom, 'yyyy-MM-dd'),
    pastTo: format(pastTo, 'yyyy-MM-dd'),
  };
};
