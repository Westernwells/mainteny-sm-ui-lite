import {
  ArticleAdditionalInfo,
  ArticleType,
  ArticleView,
  CostPackage,
} from './article';
import {PaymentTermData} from './contract';
import {
  Address,
  AddressRecord,
  Amount,
  AmountRecord,
  EmailRecord,
  Meta,
  Money,
  PaymentInfo,
  PdfGenerationStatus,
} from './misc';
import {PropertyOwnerSimpleView} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderType, ServiceOrderView} from './service-order';
import {Order} from './pagination';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CREDITED = 'CREDITED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatusFilter {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CREDITED = 'CREDITED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatusView {
  PAID = 'Paid',
  NOT_PAID = 'Sent',
  DRAFT = 'Draft',
  EXPIRED = 'Overdue',
  PARTIALLY_PAID = 'Partially Paid',
  CANCELLED = 'Cancelled',
  CREDITED = 'Credited',
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  articleId?: string;
  article?: ArticleView;
  name: string;
  unitAmount: Amount;
  quantity: number;
  description: string;
  additionalInfo?: {
    discount?: Discount;
    payment?: InvoiceItemPaymentRecord;
  };
}

export interface AggregatedInvoiceItem extends InvoiceItem {
  totalAmountToBePaid: number;
  totalPercentage: number;
}

export interface BeneficialDetails {
  name: string;
  address: Address;
}

export interface BeneficialDetailsRecord {
  name: string;
  address: AddressRecord;
}

export interface AlternativeServiceCompanyInfo {
  name?: string;
  address?: AddressRecord;
}

export interface InvoicePaymentTermRecord {
  id?: string;
  term: string;
}

export interface InvoiceAdditionalInfo {
  dueDate: string;
  pdfGenerationStatus: PdfGenerationStatus;
  pdfPath: string;
  xmlPath?: string;
  includeWorkReport: boolean;
  includeCheckList?: boolean;
  paymentInfo: PaymentInfo;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  beneficialDetails?: BeneficialDetails;
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  laborMaterialCosts: {
    LABOR: string;
    MATERIAL: string;
  };
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment<AggregatedAmount>;
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
  refInvoiceId?: string;
  paymentTerm?: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  };
  purchaseOrderNumber?: string;
  elevatorExternalId?: string;
}

export enum InvoiceOverdueNoticeStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
}

export enum InvoiceOrderField {
  CREATED_DATE = 'CREATED_DATE',
  CUSTOMER_NAME = 'CUSTOMER_NAME',
  DUE_DATE = 'DUE_DATE',
  NUMBER = 'NUMBER',
  XERO_LAST_SYNC_TIME = 'XERO_LAST_SYNC_TIME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  PROPERTY_OWNER_NAME = 'PROPERTY_OWNER_NAME',
  SENT_DATE = 'SENT_DATE',
  SERVICE_ORDER_EXTERNAL_ID = 'SERVICE_ORDER_EXTERNAL_ID',
  TYPE = 'TYPE',
  SERVICE_ORDER_TYPE = 'SERVICE_ORDER_TYPE',
  TOTAL_NET_AMOUNT = 'TOTAL_NET_AMOUNT',
  COMMENT_COUNT = 'COMMENT_COUNT',
  STATUS = 'STATUS',
}

export interface InvoiceOverdueNoticeAdditionalInfo {
  pdfPath: string;
  pdfGenerationStatus: PdfGenerationStatus;
}

export interface InvoiceOverdueNoticeSimpleView {
  id: string;
  number: string;
  externalId: string;
  subject: string;
  description: string;
  sentDate: string;
  dueDate: string;
  initialAmount: Money;
  handlingFee: Money;
  totalAmount: Money;
  status: InvoiceOverdueNoticeStatus;
  additionalInfo: InvoiceOverdueNoticeAdditionalInfo;
  meta: Meta;
}

export interface InvoiceView {
  id: string;
  number: string;
  externalId: string;
  description: string;
  subject: string;
  type: InvoiceType;
  totalAmount: AggregatedAmount;
  sentDate?: string;
  dueDate?: string;
  issuedDate?: string;
  status: InvoiceStatus;
  serviceOrder?: ServiceOrderView;
  propertyOwner: PropertyOwnerSimpleView;
  serviceCompany: ServiceCompanySimpleView;
  items: InvoiceItem[];
  search: string;
  meta: Meta;
  additionalInfo: InvoiceAdditionalInfo;
  overdueNotices: InvoiceOverdueNoticeSimpleView[];
  commentCount?: number;
  payments: InvoicePaymentView[];
  refInvoiceId?: string;
  paymentTerms?: string;
  discount: Discount;
}

export interface InvoicePaymentAdditionalInfo {
  xero?: {
    xeroEntityId: string;
    lastSyncedTime: string;
  };
  paymentDetails?: AggregatedAmount;
}

export interface InvoicePaymentView {
  additionalInfo: InvoicePaymentAdditionalInfo;
  amount: Money;
  id: string;
  invoiceId: string;
  meta: Meta;
  paidDate: string;
}

export interface QueryInvoiceParams {
  pageIndex: number;
  pageSize: number;
  order?: Order;
  orderByField?: InvoiceOrderField;
  query?: string;
  contractId?: string[];
  sentDateFrom?: string;
  sentDateTo?: string;
  status: InvoiceStatus[];
  propertyOwnerId?: string[];
  totalAmountFrom?: number;
  totalAmountTo?: number;
  type?: InvoiceType[];
  serviceOrderType?: ServiceOrderType[];
  totalGrossAmountFrom?: string;
  totalGrossAmountTo?: string;
  serviceOrderId?: string;
  hasComments?: boolean;
  elevatorId?: string[];
}

export interface InvoiceFilters {
  amount: [number, number] | number[];
  status?: InvoiceStatus;
  serviceType: ServiceOrderType[];
}

export enum DiscountType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  NONE = 'NONE',
}

export enum DiscountTypeOptions {
  AMOUNT = 'Lump-sum',
  PERCENTAGE = 'Percentage',
}

export interface Discount {
  type: DiscountType;
  amount?: Money;
  percentage?: number;
}

export enum PaymentType {
  LUMP_SUM = 'LUMP_SUM',
  PERCENTAGE = 'PERCENTAGE',
  PER_ITEM = 'PER_ITEM',
  NONE = 'NONE',
}

export enum PaymentTypeOptions {
  LUMP_SUM = 'Lump-sum',
  PERCENTAGE = 'Percentage',
  PER_ITEM = 'Per Article',
}

export interface VatAmount {
  vat: number;
  percentageVat: number;
}

export interface AggregatedAmount {
  netAmount?: number;
  grossAmount?: number;
  currency: string;
  vats: VatAmount[];
  vat?: number;
  percentageVat?: number;
  fractionDigits?: number;
}

export interface Payment<T = Money> {
  type: PaymentType;
  amount?: T;
  percentage?: number;
  description?: string;
}

export enum InvoiceItemPaymentType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

export interface InvoiceItemPaymentRecord {
  type: InvoiceItemPaymentType;
  amount?: Amount;
  percentage?: number;
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

export interface InvoiceItemRecord {
  id?: string;
  article?: ArticleRecord;
  name: string;
  description?: string;
  unitAmount: AmountRecord;
  quantity: number;
  discount?: Discount;
  payment?: InvoiceItemPaymentRecord;
  additionalInfo?:
    | {
        discount?: Discount;
        payment?: InvoiceItemPaymentRecord;
      }
    | undefined;
}

export enum InvoiceType {
  FINAL = 'FINAL',
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  CREDIT_NOTE = 'CREDIT_NOTE',
  UPFRONT = 'UPFRONT',
  AGGREGATE = 'AGGREGATE',
}

export const InvoiceTypeMap = {
  FINAL: 'Final',
  FULL: 'Full',
  PARTIAL: 'Partial',
  CREDIT_NOTE: 'Credit Note',
  UPFRONT: 'Upfront',
  AGGREGATE: 'Contract',
};

export interface InvoiceFormData {
  subject: string;
  description: string;
  dueDate?: Date;
  sentDate?: Date;
  items: InvoiceItemRecord[];
  paymentInfo: PaymentInfo;
  paymentTerm?: InvoicePaymentTermRecord;
  propertyOwnerId: string;
  serviceCompanyId: string;
  serviceOrderId?: string;
  shouldSendOut: boolean;
  type: InvoiceType;
  includeWorkReport?: boolean;
  includeCheckList?: boolean;
  costCenter?: string;
  purchaseOrderNumber?: string;
  beneficialName?: string;
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  externalId?: string;
  laborMaterialCosts?: {
    LABOR: string;
    MATERIAL: string;
  };
  laborMaterialCostText?: string;
  unitNumber?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
  deliveryStartDate?: Date;
  deliveryEndDate?: Date;
  showArticleSection?: boolean;
  notes?: CreateInvoiceComment[];
  elevatorExternalId?: string;
}

export interface CreateInvoice {
  serviceCompanyId: string;
  propertyOwnerId: string;
  serviceOrderId?: string;
  externalId?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  sentDate?: string;
  type?: InvoiceType;
  items: InvoiceItemRecord[];
  paymentTerm?: InvoicePaymentTermRecord;
  paymentInfo?: PaymentInfo;
  shouldSendOut?: boolean;
  includeWorkReport?: boolean;
  includeCheckList?: boolean;
  costCenter?: string;
  purchaseOrderNumber?: string;
  integration?: {
    xeroEntityId?: string;
  };
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  laborMaterialCosts?: {
    LABOR?: string;
    MATERIAL?: string;
  };
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
  refInvoiceId?: string;
  notes?: CreateInvoiceComment[];
}

export interface UpdateInvoice {
  serviceOrderId?: string | null;
  propertyOwnerId?: string;
  externalId?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  sentDate?: string;
  items?: InvoiceItemRecord[];
  paymentTerm?: InvoicePaymentTermRecord;
  paymentInfo?: PaymentInfo;
  includeWorkReport?: boolean;
  includeCheckList?: boolean;
  costCenter?: string;
  purchaseOrderNumber?: string;
  integration?: {
    xeroEntityId?: string;
  };
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  laborMaterialCosts?: {
    LABOR?: string;
    MATERIAL?: string;
  };
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
  elevatorExternalId?: string;
}

export interface QueryInvoiceCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateInvoiceComment {
  content: string;
  subject: string;
  id?: string;
}

export interface InvoicePaymentRecord {
  amount: Money;
  paidDate: string;
  markAsPaid: boolean;
}

export interface CreateInvoiceOverdueNoticeRecord {
  externalId: string;
  subject: string;
  description: string;
  dueDate: string;
  initialAmount: Money;
  handlingFee: Money;
  sentDate: string;
  emailRecord?: EmailRecord;
}

export enum InvoiceActivityType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
  PRINTED = 'PRINTED',
  OVERDUE_NOTICE_SENT = 'OVERDUE_NOTICE_SENT',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  PAYMENT_DELETED = 'PAYMENT_DELETED',
  INVOICE_EMAIL_SENT_FAILED = 'INVOICE_EMAIL_SENT_FAILED',
  INVOICE_EMAIL_DELIVERED = 'INVOICE_EMAIL_DELIVERED',
  OVERDUE_NOTICE_EMAIL_DELIVERED = 'OVERDUE_NOTICE_EMAIL_DELIVERED',
}

export interface InvoiceActivityView {
  id: string;
  type: InvoiceActivityType;
  data: string;
  text: string;
  additionalInfo: string;
  meta: Meta;
}

export interface MyInvoiceActivityView {
  id: string;
  type: InvoiceActivityType;
  data: string;
  text: string;
  additionalInfo: string;
  meta: Meta;
  overdueNoticeId: string;
  count: number;
  amount: number;
}

export interface InvoiceActivityOverdueNoticeSentData {
  email: string;
  overdueNoticeId: string;
}

export const ALL_MANUAL_INVOICE_TYPES = [
  InvoiceType.CREDIT_NOTE,
  InvoiceType.FINAL,
  InvoiceType.FULL,
  InvoiceType.PARTIAL,
];

export interface SendInvoiceRecord {
  pdfPath: string;
  xmlPath?: string;
  externalId: string;
  dueDate: string;
  sentDate: string;
  email: EmailRecord;
}

export interface PrintInvoiceRecord {
  pdfPath: string;
  xmlPath?: string;
  externalId: string;
  dueDate: string;
  sentDate: string;
}

export interface InvoiceGeneration {
  lastInvoiceDate?: string | null;
}

export interface InvoiceItemAmount {
  discount: Discount;
  percentageVat?: number;
  amountBeforeGlobalDiscount: Amount;
  amountAfterItemDiscount: Amount;
  amountAfterGlobalDiscount: Amount;
  payment: InvoiceItemPaymentRecord;
}

export interface InvoiceAmountDetail {
  discount: Discount;
  payment: Payment;
  amountBeforeGlobalDiscount: AggregatedAmount;
  amountAfterGlobalDiscount: AggregatedAmount;
  items: InvoiceItemAmount[];
}

export interface FetchXInvoiceByInvoiceIdParams {
  dueDate: string;
  externalId: string;
  sentDate: string;
}

export enum FILE_DESCRIPTION_PREFIXES {
  INVOICE = 'INV',
  WORK_REPORT = 'WR',
  CHECKLIST = 'CHK',
}

export type InvoiceTableRow = {
  data: InvoiceView;
  id: string;
  number: string;
  propertyOwner: PropertyOwnerSimpleView;
  date?: string;
  dueDate?: string;
  jobNumber: string;
  type: string;
  serviceOrderType?: string;
  total: number;
  status: InvoiceStatus;
  hasComments: boolean;
};

export type InvoiceFilterForm = {
  number?: string;
  jobTypes: ServiceOrderType[];
  customer?: string;
  orderNumber?: string;
  customerId?: string;
  unitId?: string;
  jobNumber?: string;
  contractId?: string;
  grossAmountMin?: number;
  grossAmountMax?: number;
  hasComment?: boolean;
};

// used to indicate fields for the search parameter in invoice endpoint
// example query [number:] [externalid:] [purchaseorder:] [contractexternalid:cta000031] [po:name:abcd] [po:number:] [po:externalid:] [po:ct:email:qq@126.com] [po:ct:phone:+4891326643] [po:ct:url:] [po:billingaddress:riem_arcaden,_willy-brandt-platz_5,_munich,_deutschland_de] [po:postaladdress:riem_arcaden,_willy-brandt-platz_5,_munich,_deutschland_de]
export type SearchParameters = {
  search?: string;
  invoiceNumber?: string;
  orderNumber?: string;
  jobNumber?: string;
};

export type InvoiceStatistics = {
  numOfInvoicesPerStatus: Record<string, number>;
};
