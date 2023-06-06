import {hoursToMinutes, secondsToMinutes} from 'date-fns';

import {ServiceOrderType} from 'models/service-order';
import {Role} from 'models/user';
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

  return convertDigitalMinsToHM(total);
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
  return name;
};

export const getRoles = (selectedRole: string) => {
  let roles: Role[] = [Role.SERVICE_MANAGER, Role.TECHNICIAN];
  if (selectedRole === 'Service Manager') {
    roles = [Role.SERVICE_MANAGER];
  } else if (selectedRole === 'Technician') {
    roles = [Role.TECHNICIAN];
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
