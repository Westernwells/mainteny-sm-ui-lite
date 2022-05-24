import {Article} from './article';
import {Elevator} from './elevator';
import {Meta, Money, Price} from './misc';
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
  unitSellingPrice: Price;
}

export interface QuotationItemRecord {
  articleId: string;
  quantity: number;
  sellingVat: number;
  unitSellingPrice: Money;
}

export interface QuotationView {
  id: string;
  serviceCompany: ServiceCompanySimpleView;
  elevator: Elevator;
  number: string;
  externalId: string;
  description: string;
  status: QuotationStatus;
  totalAmount: Price;
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
  description: string;
  elevatorId: string;
  items: QuotationItemRecord[];
  serviceCompanyId: string;
}

export interface UpdateQuotation {
  description: string;
  elevatorId: string;
  items: QuotationItemRecord[];
}
