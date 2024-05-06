import useTheme from '@mui/material/styles/useTheme';
import {t} from 'i18next';
import {
  InvoiceActivityType,
  InvoiceActivityView,
  InvoiceItemRecord,
  InvoiceStatus,
  InvoiceStatusView,
  InvoiceView,
  MyInvoiceActivityView,
} from 'models/invoice';
import {QuotationItemRecord} from 'models/quotation';
import {addDays} from 'date-fns';
import {PaymentTermData} from 'models/contract';
import {InvoicePaymentTermRecord} from '../models/invoice';
import {Currencies, formatCurrency} from './currency';
import {getAmountFromPercentage} from './utils';
import {formatDate} from './datetime';

export const getTotalFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.netAmount /
          10 ** Currencies[item.unitAmount.currency]),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

export const getTotalWithVatFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (getAmountFromPercentage(
          item.unitAmount.percentageVat,
          item.unitAmount.netAmount,
        ) /
          10 ** Currencies[item.unitAmount.currency]),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

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
    case InvoiceStatusView.CREDITED:
      return InvoiceStatus.CREDITED;
    default:
      return InvoiceStatus.DRAFT;
  }
};

export const getInvoiceActivityTitle = (
  type: InvoiceActivityType,
  activity?: MyInvoiceActivityView,
): string => {
  switch (type) {
    case InvoiceActivityType.CREATED:
      return 'Invoice created';
    case InvoiceActivityType.UPDATED:
      return 'Invoice updated';
    case InvoiceActivityType.SENT:
      return 'Invoice sent';
    case InvoiceActivityType.PRINTED:
      return 'Invoice printed';
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return 'Overdue notice sent';
    case InvoiceActivityType.CANCELLED:
      return 'Invoice cancelled';
    case InvoiceActivityType.PAID:
      return 'Invoice paid';
    case InvoiceActivityType.EXPIRED:
      return 'Invoice overdue';
    case InvoiceActivityType.PAYMENT_RECEIVED:
      return t(`Payment of {{amount}} received`, {
        amount: activity?.amount,
      });
    case InvoiceActivityType.PAYMENT_UPDATED:
      return 'Payment updated';
    case InvoiceActivityType.PAYMENT_DELETED:
      return 'Payment deleted';
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return 'Invoice not sent';
    default:
      return '';
  }
};

export const getInvoiceActivityDescription = (
  activity: InvoiceActivityView,
  invoice: InvoiceView,
): string => {
  switch (activity.type) {
    case InvoiceActivityType.SENT: {
      const invoiceNumber = invoice.externalId ?? '';
      const creatorInfo =
        activity.meta.creator?.firstName ||
        activity.meta.creator?.lastName ||
        activity.meta.creator?.username;
      return t(
        `Email with {{invoiceDetails}} ${
          creatorInfo ? `by {{creator}}` : ''
        } to {{email}} delivered`,
        {
          creator: creatorInfo,
          email: JSON.parse(activity.data).email || '',
          invoiceDetails: invoiceNumber,
        },
      );
    }
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED: {
      const invoiceNumber = invoice.externalId ?? '';
      const creatorInfo =
        activity.meta.creator?.firstName ||
        activity.meta.creator?.lastName ||
        activity.meta.creator?.username;
      return t(
        `Email with {{invoiceDetails}} ${
          creatorInfo ? `by {{creator}}` : ''
        } to {{email}} not delivered`,
        {
          creator: creatorInfo,
          email: JSON.parse(activity.data).receivers[0] || '',
          invoiceDetails: invoiceNumber,
        },
      );
    }
    default:
      return '';
  }
};

export const invoiceStatusToString = (type: InvoiceActivityType): string => {
  switch (type) {
    case InvoiceActivityType.SENT:
      return 'Invoice sent';
    case InvoiceActivityType.PRINTED:
      return 'Invoice printed';
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return 'Overdue notice sent';
    case InvoiceActivityType.CANCELLED:
      return 'Invoice cancelled';
    case InvoiceActivityType.PAID:
      return 'Invoice paid';
    case InvoiceActivityType.EXPIRED:
      return 'Invoice overdue';
    case InvoiceActivityType.PAYMENT_RECEIVED:
      return 'Payment received';
    case InvoiceActivityType.PAYMENT_UPDATED:
      return 'Payment updated';
    case InvoiceActivityType.PAYMENT_DELETED:
      return 'Payment deleted';
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return 'Invoice not sent';
    default:
      return '';
  }
};

export const getInvoiceActivityColor = (type: InvoiceActivityType): string => {
  const theme = useTheme();
  switch (type) {
    case InvoiceActivityType.SENT:
      return theme.palette.primary.main;
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return theme.palette.warning.main;
    case InvoiceActivityType.PAID:
    case InvoiceActivityType.PAYMENT_RECEIVED:
    case InvoiceActivityType.PAYMENT_UPDATED:
      return theme.palette.success.main;
    case InvoiceActivityType.EXPIRED:
    case InvoiceActivityType.PAYMENT_DELETED:
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return theme.palette.error.main;
    case InvoiceActivityType.CREATED:
    case InvoiceActivityType.UPDATED:
    case InvoiceActivityType.PRINTED:
      return theme.palette.warning.light;
    default:
      return '';
  }
};

export const getFormattedPaymentValues = (
  paymentTerm: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  },
  invoice: InvoiceView,
  invoiceAmount: number,
) => {
  const formattedInvoiceAmount = formatCurrency(invoiceAmount);

  const discountValues = paymentTerm?.data?.discountOptions?.map((d) => {
    const dueDate = addDays(
      new Date(invoice.sentDate!) || new Date(),
      d.discountDays || 0,
    );
    const formattedDueDate = formatDate(dueDate);
    const discountPercentage = d.discountPercent || 0;
    const discountAmount = invoiceAmount * (discountPercentage / 100);
    const formattedDiscountAmount = formatCurrency(discountAmount);
    const paymentAmount = invoiceAmount - discountAmount;
    const formattedPaymentAmount = formatCurrency(paymentAmount);
    return {
      formattedDueDate,
      formattedInvoiceAmount,
      formattedDiscountAmount,
      formattedPaymentAmount,
    };
  });
  return discountValues;
};

export const replacePaymentTermsPlaceholders = (
  str: string,
  replacements: {
    formattedDueDate?: string;
    formattedInvoiceAmount?: string;
    formattedDiscountAmount?: string;
    formattedPaymentAmount?: string;
  }[],
): string =>
  replacements.reduce((result, replacement) => {
    result = result.replace('{DUE_DATE}', replacement.formattedDueDate || '');
    result = result.replace(
      '{DISCOUNT_AMOUNT}',
      replacement.formattedDiscountAmount || '',
    );
    result = result.replace(
      '{INVOICE_AMOUNT}',
      replacement.formattedInvoiceAmount || '',
    );
    result = result.replace(
      '{PAYMENT_AMOUNT}',
      replacement.formattedPaymentAmount || '',
    );
    return result;
  }, str);
