import {Meta} from './misc';
import {PropertyOwner} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';

export enum QuotationStatus {
  SENT = 'SENT',
  DRAFT = 'DRAFT',
}

export interface QuotationView {
  id: string;
  number: string;
  createdDate: string;
  status: QuotationStatus | string;
  serviceCompany: ServiceCompanySimpleView;
  propertyOwner: PropertyOwner;
  search: string;
  meta: Meta;
}

export interface QueryQuotationParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  status: QuotationStatus[];
}

export interface QuotationFilters {}
