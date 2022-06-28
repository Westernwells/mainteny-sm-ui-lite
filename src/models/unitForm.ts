import {AddressRecord} from 'models/misc';

export interface LocationFormModel {
  address?: AddressRecord;
  building?: string;
  propertySegment?: string;
  keyLocation?: string;
  parking?: string;
}

export interface UnitDetailsFormModel {
  category?: string;
  manufacturer?: string;
  externalId?: string;
  numberOfStops?: number;
  cabinType?: string;
  emergencyPhoneProvider?: string;
  emergencyContractNumber?: string;
  yearBuilt?: number;
  modelOfController?: string;
  manufacturerOfController?: string;
  unitType?: string;
  model?: string;
  serialNumber?: string;
  unitCapacity?: string;
  spendingLimit?: number;
}

export interface ServiceFormModel {
  lastVisitDate?: Date;
  lastInspectionDate?: Date;
  visitsPerYear?: number;
  serviceTime?: number;
  technicianNumber?: number;
  priority?: string;
}

export interface AppointmentFormModel {
  appointmentDaysOfWeek: string[];
  openingHour?: string;
  closingHour?: string;
  requiresAppointment: string;
  requiresAppointmentNotification: string;
  appointmentNotificationDueInDays: string;
}

export interface NotesFormModel {
  note: string;
}

export interface PriorityTechnicianFormModel {
  technicianId: string | null;
  priority?: number;
}

export interface CustomerFormModel {
  propertyOwnerId?: string;
}
