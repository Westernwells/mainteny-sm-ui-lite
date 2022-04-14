import {Article} from './article';
import {Elevator} from './elevator';
import {Meta, Price} from './misc';
import {ServiceCompanySimpleView} from './service-company';

export enum QuotationStatus {
  ACCEPTED = 'ACCEPTED',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
  SENT_TO_CLIENT = 'SENT_TO_CLIENT',
}

export type QuotationAdditionalInfo = {[key: string]: string | number};

export interface QuotationItem {
  additionalInfo: QuotationAdditionalInfo;
  article: Article;
  id: string;
  quantity: number;
  quotationId: string;
  unitSalesPrice: Price;
}

export interface QuotationView {
  id: string;
  serviceCompany: ServiceCompanySimpleView;
  elevator: Elevator;
  number: string;
  externalId: string;
  description: string;
  status: QuotationStatus;
  totalSalesPrice: Price;
  additionalInfo: QuotationAdditionalInfo;
  search: string;
  meta: Meta;
  items?: QuotationItem[];
}

export interface QueryQuotationParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  status: QuotationStatus[];
}

export interface QuotationFilters {}
