export interface ScheduleForm {
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  technicianIds: string[] | null;
  dueDate: Date | null;
  purchaseOrderNumber: string | null;
  callerName: string | null;
  callerPhoneNumber: string | null;
  callTime: Date | null;
}
