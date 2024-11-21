import {Page} from 'models/pagination';

export enum PropertyType {
  ELEVATOR_MODEL = 'ELEVATOR_MODEL',
  ELEVATOR_TYPE = 'ELEVATOR_TYPE',
  ELEVATOR_SERIAL_NUMBER = 'ELEVATOR_SERIAL_NUMBER',
  ELEVATOR_CATEGORY = 'ELEVATOR_CATEGORY',
  ELEVATOR_EXTERNAL_ID = 'ELEVATOR_EXTERNAL_ID',
}

export type PropertiesQuery = Page & {
  type: PropertyType;
  query?: string;
};
