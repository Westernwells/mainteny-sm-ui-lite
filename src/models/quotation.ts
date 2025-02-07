import {
  ArticleAdditionalInfo,
  ArticleType,
  ArticleView,
  CostPackage,
} from './article';
import {ElevatorView} from './elevator';
import {
  AggregatedAmount,
  AlternativeServiceCompanyInfo,
  Discount,
} from './invoice';
import {
  AddressRecord,
  Amount,
  AmountRecord,
  Currency,
  EmailRecord,
  Meta,
  PdfGenerationStatus,
} from './misc';
import {PropertyOwnerView} from './propertyManager';
import {ServiceCompanyItem, ServiceCompanySimpleView} from './service-company';
import {Order} from './pagination';
import {theme} from 'theme';

export enum QuotationStatus {
  ACCEPTED = 'ACCEPTED',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
  SENT_TO_CLIENT = 'SENT_TO_CLIENT',
}

// order matters for quick filter displaying
export enum QUOTATION_STATUS_FILTER {
  ALL = 'ALL',
  ACCEPTED = 'ACCEPTED',
  SENT = 'SENT',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED',
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
  SUBJECT = 'SUBJECT',
}

export type QuotationAdditionalInfo = {
  pdfGenerationStatus?: PdfGenerationStatus;
  pdfPath?: string;
  serviceOrderIds?: string[];
  xero?: {
    xeroEntityId: string;
    lastSyncTime: string;
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
  additionalInfo?: ArticleAdditionalInfo;
}

export interface QuotationItemRecord {
  id?: string;
  articleId?: string;
  article?: ArticleRecord | ArticleView;
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
  totalAmount: AggregatedAmount;
  additionalInfo: QuotationAdditionalInfo;
  search: string;
  meta: Meta;
  items: QuotationItem[];
  commentCount?: number;
}

export interface QueryQuotationParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
  status: QuotationStatus[];
  createdDateStart?: Date;
  createdDateEnd?: Date;
  totalNetAmountFrom?: string;
  totalNetAmountTo?: string;
  totalGrossAmountFrom?: string;
  totalGrossAmountTo?: string;
  order?: Order;
  orderByField?: QuotationOrderField;
  elevatorId?: string[];
  propertyOwnerId?: string[];
  serviceOrderId?: string[];
  hasComments?: boolean;
}

export interface QuotationFormData {
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
  status?: QuotationStatus;
}

export interface ReplyQuotation {
  actorId?: string;
  comments: string;
  isAccepted: boolean;
  accepted: boolean;
  pdfPath: string;
  sentDate?: string;
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

export interface PrintQuotationRecord {
  pdfPath: string;
  sentDate?: string;
}

export interface SendQuotationRecord {
  pdfPath: string;
  sentDate?: string;
  email: EmailRecord;
}

export type QuotationTableRow = {
  data: QuotationView;
  id: string;
  number: string;
  subject: string;
  propertyOwner: PropertyOwnerView;
  createdDate: string;
  status: QuotationStatus;
  amount: string;
  hasComments: boolean;
};

export type QuotationFilterForm = {
  number?: string;
  customer?: string;
  customerId?: string;
  orderNumber?: string;
  unitId?: string;
  jobNumber?: string;
  netAmountMin?: number;
  netAmountMax?: number;
  hasComment?: boolean;
};

export type SearchParameters = {
  search?: string;
  quotationNumber?: string;
};

export type QuotationStatistics = {
  numOfQuotationsPerStatus: Record<string, number>;
};

export const STATUS_COLOR = {
  [QuotationStatus.ACCEPTED]: theme.palette.success.darkSuccess,
  [QuotationStatus.DRAFT]: theme.palette.action.active,
  [QuotationStatus.REJECTED]: theme.palette.error.main,
  [QuotationStatus.SENT_TO_CLIENT]: theme.palette.primary.mainLight,
};
