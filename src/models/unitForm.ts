import {AddressRecord} from 'models/misc';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {ElevatorStatus} from './elevator';

export interface AttachmentFormModel {
  documents?: FileWithPreview[];
}

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
  emergencyContactNumber?: string;
  yearBuilt?: number;
  modelOfController?: string;
  manufacturerOfController?: string;
  unitType?: string;
  model?: string;
  serialNumber?: string;
  unitCapacity?: string;
  spendingLimit?: number;
}

export interface GeneralFormModel {
  category?: string;
  manufacturer?: string;
  externalId?: string;
  yearBuilt?: number;
  model?: string;
  serialNumber?: string;
  spendingLimit?: number;
  number?: string;
  status?: ElevatorStatus;
}

export interface TechnicalDataFormModel {
  numberOfStops?: number;
  drive?: string;
  capacity?: string;
  speed?: string;
  controller?: string;
  iotDevice?: string;
  cabinType?: string;
  cageWeight?: string;
  counterWeight?: string;
  hoistingHeight?: string;
  shaftHeight?: string;
}

export interface AutoDialerFormModel {
  emergencyPhoneProvider?: string;
  systemId?: string;
  phoneConnection?: string;
  phoneNumber?: string;
  simCardNumber?: string;
  simPin?: string;
  callCenter?: string;
  placeOfInstallation?: string;
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
  shouldNotifyCustomer: boolean;
  appointmentNotificationDue: number;
}

export interface EmergencyPhoneFormModel {
  emergencyPhoneProvider?: string;
  systemId?: string;
  phoneConnection?: string;
  phoneNumber?: string;
  simCardNumber?: string;
  simPin?: string;
  callCenter?: string;
  placeOfInstallation?: string;
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
