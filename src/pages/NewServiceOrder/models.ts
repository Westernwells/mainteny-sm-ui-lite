export interface ScheduleTechnicianForm {
  startDate?: Date;
  endDate?: Date;
  startTime?: Date;
  endTime?: Date;
}

export interface DueDateFormProps {
  date: Date | null;
}

export enum RadioOptions {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULE_TECHNICIAN = 'SCHEDULE_TECHNICIAN',
  DUE_DATE = 'DUE_DATE',
}
