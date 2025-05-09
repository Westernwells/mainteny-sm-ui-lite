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
  MultiVatsAmount,
  PaymentInfo,
  PdfGenerationStatus,
} from './misc';
import {PropertyOwnerSimpleView} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderType, ServiceOrderView} from './service-order';
import {Order} from './pagination';
import {CANCEL_ACTION} from 'models/status';
import {
  ArticleInfoRecord,
  EditableQuotationSubItemRecord,
  SubItemsConfig,
} from './quotation';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CREDITED = 'CREDITED',
  CANCELLED = 'CANCELLED',
  OVERDUE_NOTICE_1 = 'OVERDUE_NOTICE_1',
  OVERDUE_NOTICE_2 = 'OVERDUE_NOTICE_2',
  OVERDUE_NOTICE_3 = 'OVERDUE_NOTICE_3',
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
  OVERDUE_NOTICE_1 = 'OVERDUE_NOTICE_1',
  OVERDUE_NOTICE_2 = 'OVERDUE_NOTICE_2',
  OVERDUE_NOTICE_3 = 'OVERDUE_NOTICE_3',
}

export enum InvoiceStatusView {
  PAID = 'Paid',
  NOT_PAID = 'Sent',
  DRAFT = 'Draft',
  EXPIRED = 'Overdue',
  PARTIALLY_PAID = 'Partially Paid',
  CANCELLED = 'Cancelled',
  CREDITED = 'Credited',
  OVERDUE_NOTICE_1 = 'Dunning 1',
  OVERDUE_NOTICE_2 = 'Dunning 2',
  OVERDUE_NOTICE_3 = 'Dunning 3',
}

export interface InvoiceItem {
  id: string;
  invoiceId?: string;
  articleId?: string;
  article?: ArticleView;
  name: string;
  unitAmount: MultiVatsAmount;
  quantity: number;
  description: string;
  additionalInfo?: {
    discount?: Discount;
    payment?: InvoiceItemPaymentRecord;
  };
}

export enum InvoiceUnitAmountSource {
  DEFAULT = 'DEFAULT',
  MIX_ARTICLE = 'MIX_ARTICLE',
  MIX_SUB_ITEMS = 'MIX_SUB_ITEMS',
}
export interface InvoiceItemAdditionalInfo {
  discount?: Discount;
  unitAmountSource?: InvoiceUnitAmountSource;
  subItemsConfig?: {
    subItemsVisible?: boolean;
    priceVisible?: boolean;
  };
  userSeqNumber?: string;
  payment?: {
    type: InvoiceItemPaymentType;
    amount: AggregatedAmount;
    percentage?: number;
  };
}

export interface InvoiceItemView {
  id: string;
  invoiceId?: string;
  articleId?: string;
  article?: ArticleView;
  name: string;
  unitAmount: MultiVatsAmount;
  unitPurchaseAmount?: MultiVatsAmount;
  quantity: number;
  description: string;
  additionalInfo?: InvoiceItemAdditionalInfo;
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
  pdfPath?: string;
  pdfGenerationStatus?: PdfGenerationStatus;
  paymentInfo?: PaymentInfo;
  generationInfo?: {
    contractId: string;
    invoiceDate: string;
    contractExternalId?: string;
    elevatorIds?: string[];
    group?: string;
    componentId?: string;
  };
  includeWorkReport?: boolean;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  includeCheckList?: boolean;
  xero?: {
    xeroEntityId: string;
    lastSyncedTime: string;
  };
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  payment?: Payment<AggregatedAmount>;
  discount?: Discount;
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
  showInvoicedSection?: boolean;
  showPaymentSection?: boolean;
  refInvoiceId?: string;
  paymentTerm?: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  };
  purchaseOrderNumber?: string;
  elevatorExternalId?: string;
  xmlPath?: string;
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
  subject: string;
  description: string;
  type: InvoiceType;
  propertyOwner: PropertyOwnerSimpleView;
  serviceCompany: ServiceCompanySimpleView;
  externalId: string;
  sentDate?: string;
  dueDate?: string;
  status: InvoiceStatus;
  serviceOrder?: ServiceOrderView;
  items: InvoiceItemView[];
  totalAmount: AggregatedAmount;
  additionalInfo: InvoiceAdditionalInfo;
  payments: InvoicePaymentView[];
  overdueNotices: InvoiceOverdueNoticeSimpleView[];
  commentCount?: number;
  search: string;
  meta: Meta;
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
  amount?: AggregatedAmount;
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
  id?: string; // only for frontend key - we don't send it to backend
  article?: ArticleInfoRecord;
  name: string;
  description?: string;
  unitPurchaseAmount?: AmountRecord;
  unitAmount: AmountRecord;
  quantity: number;
  discount?: Discount;
  payment?: InvoiceItemPaymentRecord;
  subItemsConfig?: SubItemsConfig;
  subItems?: EditableQuotationSubItemRecord[];
  userSeqNumber?: string;
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
  id?: string;
  subject: string;
  description: string;
  dueDate?: Date;
  sentDate?: Date;
  items: EditableInvoiceItem[];
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
  showInvoicedSection?: boolean;
  showPaymentSection?: boolean;
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
  showInvoicedSection?: boolean;
  showPaymentSection?: boolean;
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
  showInvoicedSection?: boolean;
  showPaymentSection?: boolean;
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
  UNCANCELLED = 'UNCANCELLED',
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
  overdueNoticePdfPath?: string;
  count?: number;
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
  pdfPath: string;
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
  amountBeforeItemDiscount?: Amount;
  amountAfterItemDiscount: Amount;
  amountAfterGlobalDiscount?: Amount;
  payment: InvoiceItemPaymentRecord;
  subItems: InvoiceSubItemAmount[];
}

export interface InvoiceSubItemAmount {
  payment: InvoiceItemPaymentType;
  discount: Discount;
  percentageVat?: number;
  amountBeforeItemDiscount: Amount;
  amountAfterItemDiscount: Amount;
  amountAfterGlobalDiscount: Amount;
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

export type QueryCancelInvoiceParams = {
  invoiceId: string;
  action: CANCEL_ACTION;
  disableNavigate?: boolean;
};

export interface CalculateInvoiceAmountRecord {
  currency: string;
  items: InvoiceItemRecord[];
  globalDiscount?: Discount;
  paymentRecord?: Payment;
}

export type EditableInvoiceItem = InvoiceItemRecord & {
  id?: string;
  margin?: number;
};

export type EditableInvoiceSubItemRecord = InvoiceSubItemRecord & {
  margin?: number;
  id?: string;
  parentId?: string;
};

export interface InvoiceSubItemsConfig {
  subItemsVisible?: boolean;
  priceVisible?: boolean;
}

export interface InvoiceSubItemRecord {
  article?: ArticleInfoRecord;
  id?: string;
  name: string;
  unitPurchaseAmount?: Amount;
  unitAmount: Amount;
  quantity: number;
  description?: string;
  userSeqNumber?: string;
}

export interface PositionRowInvoice {
  data: ArticleView;
  id: string;
  externalId: string;
  name: string;
  description: string;
  type: ArticleType;
  unit: string;
  unitPurchaseAmount?: AmountRecord;
  unitSellingAmount?: AmountRecord;
  quantity?: number;
  discount: number;
}
