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
  unitNumber?: string;
  numberOfStops?: number;
  cabinType?: string;
  emergencyPhoneProvider?: string;
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
  openingHours: string;
  requiresAppointment: string;
  requiresAppointmentNotification: string;
  appointmentNotificationDueInDays: string;
}
