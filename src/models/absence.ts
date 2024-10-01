import {EmployeeEventType, EmployeesView} from './employee';
import {Meta} from './misc';

export interface AbsenceItem {
  id: string;
  durationInDays: number;
  employee: EmployeesView;
  endTime: Date;
  startTime: Date;
  eventType: EmployeeEventType;
  eventSubtype: string;
  notes: string;
  meta: Meta;
}
