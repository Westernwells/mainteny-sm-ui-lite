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

export const generateTimeWindowRecordFromShift = ({
  shifts,
  type,
}: GenerateTimeWindowRecordFromShiftProps): TimeWindowRecord => {
  const {firstShift, secondShift} = shifts;

  if (!secondShift)
    return {
      fromTime: firstShift.fromTime,
      toTime: firstShift.toTime,
      type,
    };

  return {
    fromTime: firstShift.fromTime,
    toTime: secondShift.toTime,
    breakFromTime: firstShift.toTime,
    breakToTime: secondShift.fromTime,
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
  // TODO Remove old data mapping then BE migrates data
  workingHours.reduce((acc, workingHour) => {
    // Map weekdays
    if (workingHour.type === TimeWindowType.WEEKDAY) {
      const mappedDate = WEEK_DAYS_WITHOUT_WEEKENDS.map(
        (dayType): ShiftForm =>
          <ShiftForm>{
            [dayType]: mapShiftRestDataToShift(workingHour),
          },
      );
      return {...acc, ...mappedDate};
    }

    // map weekends
    if (workingHour.type === TimeWindowType.WEEKEND) {
      const mappedDate = [TimeWindowType.SATURDAY, TimeWindowType.SUNDAY].map(
        (dayType): ShiftForm =>
          <ShiftForm>{
            [dayType]: mapShiftRestDataToShift(workingHour),
          },
      );
      return {...acc, ...mappedDate};
    }

    // remove public holiday
    if (workingHour.type === TimeWindowType.PUBLIC_HOLIDAY) {
      return acc;
    }

    return {
      ...acc,
      [workingHour.type]: mapShiftRestDataToShift(workingHour),
    };
  }, {} as Record<TimeWindowType, ShiftEntry>);
