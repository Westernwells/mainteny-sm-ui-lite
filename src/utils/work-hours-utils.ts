import {hoursToMinutes, secondsToMinutes} from 'date-fns';

import {ServiceOrderType} from 'models/service-order';
import {Role, UserActivityView} from 'models/user';
import {WorkHoursItem, WorkHoursType} from 'models/workHours';
import {EmployeeStatus} from 'models/employee';
import {convertDigitalMinsToHM} from './datetime';

export const calculateTotalTime = (workHours: WorkHoursItem[]) => {
  const itemsTime = workHours.map((item: WorkHoursItem) => {
    let time = 0;

    if (item.durationUnit === 'DAYS') {
      time = item.duration * 8 * 60;
    } else if (item.durationUnit === 'HALF_DAYS') {
      time = item.duration * 12 * 60;
    } else if (item.durationUnit === 'MONTHS') {
      time = item.duration * 31 * 8 * 60;
    } else if (item.durationUnit === 'YEARS') {
      time = item.duration * 365 * 8 * 60;
    } else if (item.durationUnit === 'WEEKS') {
      time = item.duration * 7 * 8 * 60;
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

  return `${convertDigitalMinsToHM(total)} h`;
};

export const formatServiceName = (
  name: WorkHoursType | ServiceOrderType | null | undefined,
) => {
  if (name === null) return '-';
  if (name === WorkHoursType.REGULAR || name === ServiceOrderType.REGULAR)
    return 'Maintenance';
  if (name === WorkHoursType.EMERGENCY || name === ServiceOrderType.EMERGENCY)
    return 'Emergency';
  if (name === WorkHoursType.CALLOUT || name === ServiceOrderType.CALLOUT)
    return 'Callout';
  if (name === WorkHoursType.REPAIR || name === ServiceOrderType.REPAIR)
    return 'Repair';
  if (name === WorkHoursType.INSPECTION || name === ServiceOrderType.INSPECTION)
    return 'Inspection';
  if (
    name === WorkHoursType.NEW_INSTALLATION ||
    name === ServiceOrderType.NEW_INSTALLATION
  )
    return 'Installation';
  if (
    name === WorkHoursType.MODERNIZATION ||
    name === ServiceOrderType.MODERNIZATION
  )
    return 'Modernization';
  if (name === WorkHoursType.GENERAL || name === ServiceOrderType.GENERAL)
    return 'General';
  if (name === WorkHoursType.OPERATION || name === ServiceOrderType.OPERATION)
    return 'Operation';
  return name;
};

export const getRoles = (selectedRole: string) => {
  let roles: Role[] = [Role.SERVICE_MANAGER, Role.TECHNICIAN, Role.CONTRACTOR];
  if (selectedRole === 'Service Manager') {
    roles = [Role.SERVICE_MANAGER];
  } else if (selectedRole === 'Technician') {
    roles = [Role.TECHNICIAN];
  } else if (selectedRole === 'Contractor') {
    roles = [Role.CONTRACTOR];
  }

  return roles;
};

export const getEmployeeStatus = (status: EmployeeStatus) => {
  switch (status) {
    case EmployeeStatus.HOLIDAY:
      return 'Holiday';
    case EmployeeStatus.PUBLIC_HOLIDAY:
      return 'Public Holiday';
    case EmployeeStatus.WEEKEND:
      return 'Weekend';
    case EmployeeStatus.SICK_LEAVE:
      return 'Sick';
    case EmployeeStatus.WORKING:
      return 'Working';
    default:
      return 'Working';
  }
};

export const convertMinutesToHoursAndMinutes = (
  minutes: number,
  {hourUnit = 'h'}: {hourUnit?: string} = {},
  hoursPad = 2,
) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hoursPadded = hours.toString().padStart(hoursPad, '0');
  const minsPadded = mins.toString().padStart(2, '0');

  return `${hoursPadded}:${minsPadded}${hourUnit}`;
};

export const convertHoursAndMinutesToMinutes = (timeString: string): number => {
  // Regular expression to match the "hh:mm" format
  const timeRegex = /^(\d{1,2}):(\d{2})$/;

  // Check if the input string matches the expected format
  if (!timeRegex.test(timeString)) {
    return 0; // Return 0 if the format is not valid
  }

  // Extract hours and minutes from the input string
  const [, hours, minutes] = timeString.match(timeRegex) as RegExpMatchArray;

  // Convert hours and minutes to total minutes
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

export const calculateTotalActivityTime = (workHours: UserActivityView[]) => {
  const itemsTime = workHours.map(
    (item: UserActivityView) => item.billableMinutes,
  );

  const total = itemsTime.reduce(
    (accumulator, item) => (accumulator ?? 0) + (item ?? 0),
    0,
  );

  return `${convertDigitalMinsToHM(total ?? 0)} h`;
};
