import {ArticleType, ArticleView, CostPackage} from './article';
import {ElevatorView} from './elevator';
import {AlternativeServiceCompanyInfo, Discount} from './invoice';
import {AddressRecord, Amount, AmountRecord, Meta, Order} from './misc';
import {PropertyOwnerView} from './propertyManager';
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

export enum QuotationOrderField {
  CUSTOMER_NAME = 'CUSTOMER_NAME',
  CREATED_DATE = 'CREATED_DATE',
  SALES_PRICE = 'SALES_PRICE',
  XERO_LAST_SYNC_TIME = 'XERO_LAST_SYNC_TIME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  PROPERTY_OWNER_NAME = 'PROPERTY_OWNER_NAME',
  ELEVATOR_ADDRESS = 'ELEVATOR_ADDRESS',
  TOTAL_NET_AMOUNT = 'TOTAL_NET_AMOUNT',
  COMMENT_COUNT = 'COMMENT_COUNT',
  STATUS = 'STATUS',
}

export type QuotationAdditionalInfo = {
  [key: string | number]: any;
};

export interface QuotationItem {
  additionalInfo: QuotationAdditionalInfo;
  article: ArticleView;
  id: string;
  description: string;
  name: string;
  quantity: number;
  quotationId: string;
  unitAmount: Amount;
}

export interface ArticleRecord {
  id?: string;
  name?: string;
  externalId?: string;
  type?: ArticleType;
  unit?: string;
  unitSellingAmount?: AmountRecord;
  costPackage?: CostPackage;
}

export interface QuotationItemRecord {
  articleId?: string;
  article?: ArticleRecord;
  name: string;
  unitAmount: AmountRecord;
  quantity: number;
  description?: string;
  discount?: Discount;
}

export interface QuotationView {
  id: string;
  serviceCompany: ServiceCompanySimpleView;
  elevator: ElevatorView;
  number: string;
  externalId: string;
  description: string;
  propertyOwner: PropertyOwnerView;
  subject: string;
  moreInfo: string;
  status: QuotationStatus;
  totalAmount: Amount;
  additionalInfo: QuotationAdditionalInfo;
  search: string;
  meta: Meta;
  items: QuotationItem[];
  commentCount?: number;
}

export interface QueryQuotationParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  status: QuotationStatus[];
  createdDateStart?: Date;
  createdDateEnd?: Date;
  salesPriceStart?: number;
  salesPriceEnd?: number;
  order?: Order;
  orderByField?: QuotationOrderField;
}

export interface QuotationFilters {}

export interface QuotationFormData {
  serviceCompanyId: string;
  elevatorId?: string;
  externalId?: string;
  subject: string;
  description: string;
  moreInfo?: string;
  items: QuotationItemRecord[];
  integration?: {
    xeroEntityId?: string;
  };
  discount?: Discount;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  paymentTerms?: string;
  notes?: string;
  sentDate?: Date;
  expiryDate?: Date;
  referenceNumber?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  propertyOwnerId?: string;
}

export interface CreateQuotation {
  serviceCompanyId: string;
  elevatorId?: string | null;
  externalId?: string;
  subject: string;
  description: string;
  moreInfo?: string;
  items: QuotationItemRecord[];
  integration?: {
    xeroEntityId?: string;
  };
  discount?: Discount;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  paymentTerms?: string;
  notes?: string;
  sentDate?: string;
  expiryDate?: string;
  referenceNumber?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  propertyOwnerId?: string;
}

export interface UpdateQuotation {
  subject: string;
  description: string;
  moreInfo?: string;
  elevatorId?: string | null;
  items: QuotationItemRecord[];
  externalId?: string;
  integration?: {
    xeroEntityId?: string;
  };
  discount?: Discount;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  paymentTerms?: string;
  notes?: string;
  sentDate?: string;
  expiryDate?: string;
  referenceNumber?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
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
  PRINTED = 'PRINTED',
}

export interface QuotationActivityView {
  id: string;
  type: QuotationActivityType;
  data: string;
  text: string;
  additionalInfo: string;
  meta: Meta;
}
