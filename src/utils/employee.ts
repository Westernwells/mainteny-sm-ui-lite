import {TFunction} from 'i18next';
import {UserView} from '../models/user';
import {TechnicianEventPair} from '../models/technician';
import {EmployeeContractTableRow, EmployeeEventType} from '../models/employee';
import {AvailabilityType} from '../models/availability';
import {getAvailabilityTypeFromTechnicianEventType} from './availability';
import {convertToText, titleCase} from './utils';
import {DEFAULT_EMPLOYEE_EVENT_TYPES} from './constants';

export const aggregateEmployeeRows = (
  employees: UserView[],
  techniciansEvents: {[key: string]: TechnicianEventPair[]},
): EmployeeContractTableRow[] => {
  if (!employees) return [];

  return employees.map((item: UserView): EmployeeContractTableRow => {
    const {workingHours, employeeId, team} = item.userData;
    const shift =
      workingHours && workingHours.length > 0
        ? `${workingHours[0].fromTime} - ${workingHours[0].toTime}`
        : '-';
    const events = techniciansEvents[employeeId];
    const event: AvailabilityType =
      events && events.length > 0
        ? getAvailabilityTypeFromTechnicianEventType(
            events[0].eventViews[0].eventType,
          )
        : AvailabilityType.AVAILABLE;

    return {
      id: item.id,
      name: `${item.userAccount.firstName} ${item.userAccount.lastName}`,
      email: item.userAccount.contact.email,
      roles: item.userAccount.roles,
      address: item.userData.address?.fullName || '-',
      phone: item.userAccount.contact.phone,
      photoUrl: item.userAccount.photoUrl,
      shift,
      availability: event,
      team,
      employeeId,
    };
  });
};

export const getEventSubtype = (
  {subtype, type}: {subtype: string; type: EmployeeEventType},
  t: TFunction<'translation', undefined>,
) => {
  if (type === 'BREAK') {
    return t(titleCase(convertToText(type)));
  }

  if (DEFAULT_EMPLOYEE_EVENT_TYPES.includes(subtype)) {
    return t(titleCase(convertToText(subtype)));
  }

  return subtype || t(type);
};
