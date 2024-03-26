import {startOfDay, differenceInMinutes} from 'date-fns';
import {getDateObject} from 'utils/datetime';
import {ScheduledItemGroup} from './model';

interface PositionOptions {
  scheduleItemGroup: ScheduledItemGroup;
  startDateTime: string;
  rowKey: string;
  orderId: string;
  gridWidth: number;
  nextOrderStartTime?: string;
}

interface WidthOptions {
  startDateTime: string;
  endDateTime: string;
  gridWidth: number;
  horizontalPosition: number;
}

export const getItemPosition = ({
  scheduleItemGroup,
  startDateTime,
  rowKey,
  orderId,
  gridWidth,
}: PositionOptions) => {
  if (Object.keys(scheduleItemGroup).length) {
    const morningTime = startOfDay(new Date(startDateTime));
    const orderStartTime = getDateObject(startDateTime);
    const x =
      gridWidth * (differenceInMinutes(orderStartTime, morningTime) / 60);
    if (scheduleItemGroup[rowKey]) {
      const group = scheduleItemGroup[rowKey];
      const itemNestLevel = group[orderId];

      return {x: `${x}px`, y: `${itemNestLevel}`};
    }
  }
  return {x: '0px', y: '0px'};
};

export const getItemWidth = ({
  startDateTime,
  endDateTime,
  gridWidth,
  horizontalPosition,
}: WidthOptions) => {
  const hoursInDay = 24;
  const width = Math.min(
    (differenceInMinutes(
      getDateObject(endDateTime),
      getDateObject(startDateTime),
    ) /
      60) *
      gridWidth,
    gridWidth * hoursInDay - horizontalPosition,
  );

  return `${width}px`;
};

export const getPxFromString = (str: string) => Number(str.split('px')[0]);
