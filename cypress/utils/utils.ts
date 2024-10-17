import {
  InvoiceStatusView,
  InvoiceStatus,
  AggregatedAmount,
  InvoiceAdditionalInfo,
  InvoiceItem,
  InvoiceOverdueNoticeSimpleView,
  InvoicePaymentView,
  InvoiceType,
} from '../../src/models/invoice';
import {Meta} from '../../src/models/misc';
import {PropertyOwnerSimpleView} from '../../src/models/propertyManager';
import {ServiceCompanySimpleView} from '../../src/models/service-company';
import {ServiceOrderView} from '../../src/models/service-order';

export const randomEnumKey = (enumeration: {}) => {
  const keys = Object.keys(enumeration).filter(
    (k) => !(Math.abs(Number.parseInt(k, 10)) + 1),
  );
  const enumKey = keys[Math.floor(Math.random() * keys.length)];

  return enumKey;
};

export const randomEnumValue = (enumeration: {[x: string]: any}) =>
  enumeration[randomEnumKey(enumeration)];

export const mapInvoiceStatus = (invoiceStatus: InvoiceStatusView) => {
  switch (invoiceStatus) {
    case InvoiceStatusView.PAID:
      return InvoiceStatus.PAID;
    case InvoiceStatusView.NOT_PAID:
      return InvoiceStatus.NOT_PAID;
    case InvoiceStatusView.DRAFT:
      return InvoiceStatus.DRAFT;
    case InvoiceStatusView.EXPIRED:
      return InvoiceStatus.EXPIRED;
    case InvoiceStatusView.PARTIALLY_PAID:
      return InvoiceStatus.PARTIALLY_PAID;
    case InvoiceStatusView.CANCELLED:
      return InvoiceStatus.CANCELLED;
    default:
      return InvoiceStatus.DRAFT;
  }
};

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
  paymentTerms?: string;
}

export const statusMapping: Record<string, string> = {
  Active: 'VALID',
  Inactive: 'EXPIRED',
  Expiring: 'EXPIRING',
};

export const convertToMacro = (text: string) =>
  text.toUpperCase().split(' ').join('_');

export const extractNumbersFromCurrencyString = (amount: string) =>
  // Use regex to remove any non-numeric characters except for the minus sign and dot
  parseFloat(amount.replace(/[^0-9.-]+/g, ''));

export const navigateCy = (primaryId: string, secondaryId: string) => {
  cy.get(`[data-testid="${primaryId}-nav-item"]`).trigger('mouseover');
  cy.get(
    `[data-testid="${primaryId}-nav-item"] [data-testid="ExpandLessIcon"]`,
  ).click();
  cy.get(`[data-testid="${secondaryId}-nav-item"]`).click();
};
