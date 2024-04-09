export interface ScheduleForm {
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  technicianIds: string[] | null;
}
