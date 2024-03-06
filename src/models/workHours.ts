import {Meta} from './misc';
import {UserAccountSimpleView} from './user';

interface WorkHoursMeta extends Meta {
  deleted: boolean;
}

export interface SecondTimeItem {
  startTime: string;
  endTime: string;
  duration: number;
  durationUnit: string;
}

export interface WorkHoursItemAdditionalInfo {
  secondTime: SecondTimeItem;
  baseTime: number;
  billableTime: number;
}

export interface WorkHoursItem {
  data: any;
  description: string;
  duration: number;
  durationUnit: string;
  endTime: string;
  id: string;
  meta: WorkHoursMeta;
  refId?: string;
  search: string;
  startTime: string;
  type: WorkHoursType;
  user: UserAccountSimpleView;
  additionalInfo: WorkHoursItemAdditionalInfo;
}

export enum WorkHoursType {
  REGULAR = 'SERVICE_ORDER_REGULAR',
  EMERGENCY = 'SERVICE_ORDER_EMERGENCY',
  REPAIR = 'SERVICE_ORDER_REPAIR',
  CALLOUT = 'SERVICE_ORDER_CALLOUT',
  INSPECTION = 'SERVICE_ORDER_INSPECTION',
  NEW_INSTALLATION = 'SERVICE_ORDER_NEW_INSTALLATION',
  MODERNIZATION = 'SERVICE_ORDER_MODERNIZATION',
  GENERAL = 'SERVICE_ORDER_GENERAL',
  OTHERS = 'OTHERS',
  SICK_LEAVE = 'SICK_LEAVE',
  HOLIDAY = 'HOLIDAY',
  OFFICE_HOURS = 'OFFICE_HOURS',
  BREAK = 'BREAK',
  TRAINING = 'TRAINING',
}
