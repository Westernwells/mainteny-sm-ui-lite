import {Article} from './article';
import {Elevator, ElevatorSimpleView} from './elevator';
import {Amount, Meta} from './misc';
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
  description: string;
  name: string;
  quantity: number;
  quotationId: string;
  unitAmount: Amount;
}

export interface QuotationItemRecord {
  articleId: string;
  articleUnit: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: Amount;
}

export interface QuotationView {
  id: string;
  serviceCompany: ServiceCompanySimpleView;
  elevator: ElevatorSimpleView;
  number: string;
  externalId: string;
  description: string;
  subject: string;
  moreInfo: string;
  status: QuotationStatus;
  totalAmount: Amount;
  additionalInfo: QuotationAdditionalInfo;
  search: string;
  meta: Meta;
  items: QuotationItem[];
}

export interface QueryQuotationParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  status: QuotationStatus[];
}

export interface QuotationFilters {}

export interface CreateQuotation {
  subject: string;
  description: string;
  moreInfo: string;
  elevatorId: string;
  items: QuotationItemRecord[];
  serviceCompanyId: string;
}

export interface UpdateQuotation {
  subject: string;
  description: string;
  moreInfo: string;
  elevatorId: string;
  items: QuotationItemRecord[];
}
