import {startOfDay, differenceInMinutes} from 'date-fns';
import {getDateObject, formatDate} from 'utils/datetime';
import {ScheduledItemGroup} from './model';

interface PositionOptions {
  scheduleItemGroup: ScheduledItemGroup;
  startDateTime: string;
  rowKey: string;
  orderId: string;
  gridWidth: number;
}

interface WidthOptions {
  startDateTime: string;
  endDateTime: string;
  gridWidth: number;
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
    const nestedKey = formatDate(new Date(startDateTime), 'HH')!;
    const group = scheduleItemGroup[rowKey][nestedKey];
    const itemIndex = group.indexOf(orderId);

    return {x: `${x}px`, y: `${itemIndex + 1}`};
  }
  return {x: '0px', y: '0px'};
};

export const getItemWidth = ({
  startDateTime,
  endDateTime,
  gridWidth,
}: WidthOptions) => {
  const width =
    (differenceInMinutes(
      getDateObject(endDateTime),
      getDateObject(startDateTime),
    ) /
      60) *
    gridWidth;

  return `${width}px`;
};
