import {format, parseISO} from 'date-fns';

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

export function formatDate(input?: String | Date, formatType?: string) {
  if (!input) {
    return undefined;
  }
  return formatType
    ? format(getDateObject(input), formatType)
    : format(getDateObject(input), 'yyyy-MM-dd');
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
  return parseISO(value?.toString());
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
