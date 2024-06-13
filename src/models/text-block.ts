import {Meta, Order} from './misc';

export interface CreateTextBlockRecord {
  serviceCompanyId: string;
  category: string;
  name: string;
  text: string;
}

export interface UpdateTextBlockRecord {
  category?: string;
  name?: string;
  text?: string;
}

export interface TextBlockFilters {}

export interface QueryTextBlockParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  categories: TextBlockCategory[];
  order?: Order;
  orderByField?: TextBlockOrderField;
}

export interface TextBlockView {
  id: string;
  serviceCompanyId: string;
  category: TextBlockCategory;
  name: string;
  text: string;
  search: string;
  additionalInfo: string;
  meta: Meta;
}

export interface TextBlockFormModel {
  name: string;
  category: string;
  text: string;
}

export enum TextBlockOrderField {
  NAME = 'NAME',
  CATEGORY = 'CATEGORY',
  CREATED_AT = 'CREATED_AT',
}

export enum TextBlockCategory {
  QUOTATION = 'QUOTATION',
  INVOICE = 'INVOICE',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  SERVICE_ORDER = 'SERVICE_ORDER',
}

export interface TextBlockRow {
  id: string;
  NAME: string;
  CATEGORY: string;
  CREATED_AT: string;
  text: string;
  wordCount: number;
  editedAt: string;
}
