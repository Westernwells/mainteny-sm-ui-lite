import {UserView} from '../models/user';
import {TechnicianEventPair} from '../models/technician';
import {EmployeeContractTableRow} from '../models/employee';
import {AvailabilityType} from '../models/availability';
import {getAvailabilityTypeFromTechnicianEventType} from './availability';

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
