import {hoursToMinutes, secondsToMinutes} from 'date-fns';

import {WorkHoursItem} from 'models/workHours';
import {convertDigitalMinsToHM} from './datetime';

export const calculateTotalTime = (workHours: WorkHoursItem[]) => {
  const itemsTime = workHours.map((item: WorkHoursItem) => {
    let time = 0;

    if (item.durationUnit === 'DAYS') {
      time = item.duration * 24 * 60;
    } else if (item.durationUnit === 'HALF_DAYS') {
      time = item.duration * 12 * 60;
    } else if (item.durationUnit === 'MONTHS') {
      time = item.duration * 31 * 24 * 60;
    } else if (item.durationUnit === 'YEARS') {
      time = item.duration * 365 * 24 * 60;
    } else if (item.durationUnit === 'WEEKS') {
      time = item.duration * 7 * 24 * 60;
    } else if (item.durationUnit === 'HOURS') {
      hoursToMinutes(item.duration);
    } else if (item.durationUnit === 'MINUTES') {
      time = item.duration;
    } else if (item.durationUnit === 'SECONDS') {
      secondsToMinutes(item.duration);
    }

    return {
      time,
    };
  });

  const total = itemsTime.reduce(
    (accumulator, item) => accumulator + item.time,
    0,
  );

  return convertDigitalMinsToHM(total);
};
