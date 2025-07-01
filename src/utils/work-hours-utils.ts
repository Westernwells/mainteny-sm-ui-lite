import {ServiceOrderType} from 'models/service-order';
import {Role, UserActivityStatistics, UserActivityView} from 'models/user';
import {WorkHoursType} from 'models/workHours';
import {EmployeeStatus} from 'models/employee';
import {MinToStep} from 'models/service-company';
import {convertDigitalMinsToHM} from './datetime';

export const calculateTotalTime = (workHours: UserActivityView[]) => {
  const total = workHours.reduce((accumulator, item) => {
    if (item.type === WorkHoursType.BREAK) return accumulator;

    return accumulator + (item.billableMinutes || 0);
  }, 0);

  return `${convertDigitalMinsToHM(total)} h`;
};

export const calculateTotalTimeStatistics = (
  workHours?: UserActivityStatistics,
) => {
  if (!workHours) {
    return `${convertDigitalMinsToHM(0)} h`;
  }

  const billableHours = workHours.totalBillableMinutesPerType ?? {};

  const total = Object.keys(billableHours).reduce(
    (sum, key) => (key !== 'BREAK' ? sum + billableHours[key] : sum),
    0,
  );

  return `${convertDigitalMinsToHM(total)} h`;
};

export const formatServiceName = (
  name: WorkHoursType | ServiceOrderType | string | null | undefined,
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
  } else if (selectedRole === 'Both Technician & Service Manager') {
    roles = [Role.SERVICE_MANAGER, Role.TECHNICIAN];
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

export const convertMinutesWithRounding = (
  minutes: number,
  {hourUnit = 'h'}: {hourUnit?: string} = {},
  hoursPad = 2,
  roundingInterval: MinToStep = MinToStep.STEP_0,
) => {
  if (roundingInterval > 0) {
    minutes = Math.ceil(minutes / roundingInterval) * roundingInterval;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hoursPadded = hours.toString().padStart(hoursPad, '0');
  const minsPadded = mins.toString().padStart(2, '0');

  return `${hoursPadded}:${minsPadded}${hourUnit}`;
};

export const convertHoursAndMinutesToMinutes = (timeString: string): number => {
  // Regular expression to match the "hh:mm" format
  const timeRegex = /^(\d{1,2}):(\d{1,2})$/;

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

export const completeTimePadding = (timeStr?: string) => {
  if (!timeStr) {
    return '00:00';
  }

  let [hours, minutes] = timeStr.split(':');
  hours = hours.padStart(2, '0');
  minutes = minutes.padStart(2, '0');
  return `${hours}:${minutes}`;
};
