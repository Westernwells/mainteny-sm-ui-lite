export type AbsenceForm = {
  duration: string;
  typeAbsence: string;
  date?: Date;
  dateStart?: Date;
  dateEnd?: Date;
  notes: string;
};

export type AbsenceUpdate = {
  endTime: Date | string;
  eventType: string;
  notes: string;
  startTime: Date | string;
};
