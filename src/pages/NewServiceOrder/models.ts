export interface ScheduleTechnicianForm {
  date: Date | null;
  startTime: Date | undefined;
  endTime: Date | undefined;
  technicianId: string | null;
}

export interface DueDateFormProps {
  date: Date | null;
}

export enum RadioOptions {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULE_TECHNICIAN = 'SCHEDULE_TECHNICIAN',
  DUE_DATE = 'DUE_DATE',
}
