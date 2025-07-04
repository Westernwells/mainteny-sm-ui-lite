import {Meta} from 'models/misc';
import {Page} from 'models/pagination';

export enum TagEntityType {
  ADDRESS = 'ADDRESS',
  ARTICLE = 'ARTICLE',
  ARTICLE_SUPPLIER = 'ARTICLE_SUPPLIER',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  CONTRACT = 'CONTRACT',
  CONTACT_PERSON = 'CONTACT_PERSON',
  ELEVATOR = 'ELEVATOR',
  EMPLOYEE = 'EMPLOYEE',
  INVOICE = 'INVOICE',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  PROPERTY_CONTACT_PERSON = 'PROPERTY_CONTACT_PERSON',
  QUOTATION = 'QUOTATION',
  CONTACT_PERSON_ASSOCIATION = 'CONTACT_PERSON_ASSOCIATION',
  SERVICE_COMPANY = 'SERVICE_COMPANY',
  SERVICE_COMPANY_ACTIVITY = 'SERVICE_COMPANY_ACTIVITY',
  SERVICE_ORDER = 'SERVICE_ORDER',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
  TASK = 'TASK',
}

// Mapping to get text color from background color
export const TAG_COLORS: Record<string, string> = {
  '#CFF7D3': '#02542D',
  '#C8F2FA': '#0F4C64',
  '#D6EBFF': '#2196F3',
  '#DAD3FF': '#462DC6',
  '#F9DAF2': '#71155D',
  '#FDD3D0': '#C00F0C',
  '#FEE4CC': '#9F6012',
  '#FFF1C2': '#975102',
  '#E6E6E6': '#444444',
};

export const SELECTABLE_COLORS = Object.keys(TAG_COLORS);

export type Tag = {
  id: string;
  serviceCompanyId: string;
  name: string;
  color: string;
  entityType: TagEntityType;
  search: string;
  meta: Meta;
};

export type TagRecord = Pick<Tag, 'id' | 'name' | 'color'>;

export type UpdateTagRecord = Pick<Tag, 'name' | 'color' | 'entityType'>;

export type GetTagsQuery = Page & {
  serviceCompanyId: string;
  entityType: TagEntityType;
  query: string;
};

export type TagStatistics = {
  numOfTagsPerColors: Record<string, number>;
};

export type TagStatisticsQuery = {
  entityType?: TagEntityType;
  query?: string;
};
