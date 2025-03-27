import {
  Shift,
  ShiftEntry,
  ShiftForm,
  TimeWindowRecord,
  TimeWindowType,
} from 'models/employee';
import {format} from 'date-fns';
import {
  parseTimeFromHoursMinutesToDate,
  WEEK_DAYS_WITHOUT_WEEKENDS,
} from 'utils/datetime';

type GenerateTimeWindowRecordFromShiftProps = {
  shifts: ShiftEntry;
  type: TimeWindowType;
};

// Helper: Pad time values to HH:mm format
const padTime = (time: string): string => {
  const [h, m] = time.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
};

export const generateTimeWindowRecordFromShift = ({
  shifts,
  type,
}: GenerateTimeWindowRecordFromShiftProps): TimeWindowRecord => {
  const {firstShift, secondShift} = shifts;

  if (!secondShift)
    return {
      fromTime: padTime(firstShift.fromTime),
      toTime: padTime(firstShift.toTime),
      type,
    };

  return {
    fromTime: padTime(firstShift.fromTime),
    toTime: padTime(secondShift.toTime),
    breakFromTime: padTime(firstShift.toTime),
    breakToTime: padTime(secondShift.fromTime),
    type,
  };
};

export const generateShiftRestDataFromForm = (
  formData: ShiftForm,
): TimeWindowRecord[] =>
  Object.entries(formData).reduce((acc, currentShiftForm) => {
    const [type, shifts] = currentShiftForm;

    return [
      ...acc,
      generateTimeWindowRecordFromShift({
        shifts,
        type: type as TimeWindowType,
      }),
    ];
  }, [] as TimeWindowRecord[]);

export const mapShiftRestDataToShift = (
  workDay: TimeWindowRecord,
): ShiftEntry => {
  const {fromTime, toTime, breakFromTime, breakToTime} = workDay;

  if (!breakToTime || !breakFromTime)
    return {
      firstShift: {
        fromTime,
        toTime,
      },
    };

  return {
    firstShift: {
      fromTime,
      toTime: breakFromTime,
    },
    secondShift: {
      fromTime: breakToTime,
      toTime,
    },
  };
};

export const mapShiftStringDateToDate = (shift?: Partial<Shift>) => ({
  fromTime: shift?.fromTime
    ? parseTimeFromHoursMinutesToDate(shift?.fromTime)
    : undefined,
  toTime: shift?.toTime
    ? parseTimeFromHoursMinutesToDate(shift?.toTime)
    : undefined,
});

export const getShiftStringFromDate = (date: Date) => format(date, 'HH:mm');

export const aggregateWeekShifts = (
  workingHours: TimeWindowRecord[],
): ShiftForm =>
  workingHours.reduce((acc, workingHour) => {
    if (workingHour.type === TimeWindowType.WEEKDAY) {
      const mappedDate = WEEK_DAYS_WITHOUT_WEEKENDS.map(
        (dayType): ShiftForm =>
          <ShiftForm>{
            [dayType]: mapShiftRestDataToShift(workingHour),
          },
      );
      return {...acc, ...mappedDate};
    }

    if (workingHour.type === TimeWindowType.WEEKEND) {
      const mappedDate = [TimeWindowType.SATURDAY, TimeWindowType.SUNDAY].map(
        (dayType): ShiftForm =>
          <ShiftForm>{
            [dayType]: mapShiftRestDataToShift(workingHour),
          },
      );
      return {...acc, ...mappedDate};
    }

    if (workingHour.type === TimeWindowType.PUBLIC_HOLIDAY) {
      return acc;
    }

    return {
      ...acc,
      [workingHour.type]: mapShiftRestDataToShift(workingHour),
    };
  }, {} as Record<TimeWindowType, ShiftEntry>);
