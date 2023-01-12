import {Article} from './article';
import {ElevatorView} from './elevator';
import {Amount, Meta} from './misc';
import {ServiceCompanySimpleView} from './service-company';

export enum QuotationStatus {
  ACCEPTED = 'ACCEPTED',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
  SENT_TO_CLIENT = 'SENT_TO_CLIENT',
}

export enum QuotationStatusView {
  ACCEPTED = 'ACCEPTED',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
  SENT = 'SENT_TO_CLIENT',
}

export type QuotationAdditionalInfo = {
  [key: string | number]: any;
};

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
  elevator: ElevatorView;
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
  createdDateStart?: string;
  createdDateEnd?: string;
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

export interface ReplyQuotation {
  actorId?: string;
  comments: string;
  isAccepted: boolean;
  accepted: boolean;
}

export interface QueryQuotationCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateQuotationComment {
  content: string;
  subject: string;
}

export enum QuotationActivityType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  SERVICE_ORDER_ADDED = 'SERVICE_ORDER_ADDED',
  SERVICE_ORDER_REMOVED = 'SERVICE_ORDER_REMOVED',
}

export interface QuotationActivityView {
  id: string;
  type: QuotationActivityType;
  data: string;
  text: string;
  additionalInfo: string;
  meta: Meta;
}
