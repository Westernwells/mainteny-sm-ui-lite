import {startOfDay, differenceInMinutes, isBefore, isAfter} from 'date-fns';
import {getDateObject} from 'utils/datetime';
import {ScheduledItemGroup} from './model';

interface PositionOptions {
  scheduleItemGroup: ScheduledItemGroup;
  startDateTime: string;
  viewDate: Date;
  rowKey: string;
  orderId: string;
  gridWidth: number;
  nextOrderStartTime?: string;
}

interface WidthOptions {
  startDateTime: string;
  endDateTime: string;
  viewDate: Date;
  gridWidth: number;
  horizontalPosition: number;
}

export const getItemPosition = ({
  scheduleItemGroup,
  startDateTime,
  viewDate,
  rowKey,
  orderId,
  gridWidth,
}: PositionOptions) => {
  if (Object.keys(scheduleItemGroup).length) {
    const startDateIsInPast = isBefore(
      startOfDay(new Date(startDateTime)),
      startOfDay(viewDate),
    );

    const morningTime = startOfDay(
      startDateIsInPast ? viewDate : new Date(startDateTime),
    );
    const orderStartTime = getDateObject(startDateTime);
    const x =
      gridWidth * (differenceInMinutes(orderStartTime, morningTime) / 60);
    if (scheduleItemGroup[rowKey]) {
      const group = scheduleItemGroup[rowKey];
      const itemNestLevel = group[orderId];

      return {x: x < 0 ? '0px' : `${x}px`, y: `${itemNestLevel}`};
    }
  }
  return {x: '0px', y: '0px'};
};

export const getItemWidth = ({
  startDateTime,
  endDateTime,
  viewDate,
  gridWidth,
  horizontalPosition,
}: WidthOptions) => {
  const hoursInDay = 24;
  const startDateIsInPast = isBefore(
    startOfDay(new Date(startDateTime)),
    startOfDay(viewDate),
  );
  const endDateIsInFuture = isAfter(
    startOfDay(new Date(endDateTime)),
    startOfDay(viewDate),
  );

  const width = Math.min(
    (differenceInMinutes(
      getDateObject(endDateTime),
      getDateObject(
        startDateIsInPast && !endDateIsInFuture
          ? startOfDay(new Date(endDateTime))
          : startDateTime,
      ),
    ) /
      60) *
      gridWidth,
    gridWidth * hoursInDay - horizontalPosition,
  );

  return `${width}px`;
};

export const getPxFromString = (str: string) => Number(str.split('px')[0]);
