import useTheme from '@mui/material/styles/useTheme';
import {
  InvoiceActivityType,
  InvoiceItemRecord,
  InvoiceStatus,
  InvoiceStatusView,
} from 'models/invoice';
import {Amount} from 'models/misc';
import {QuotationItemRecord} from 'models/quotation';

export const getTotalFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord<Amount>[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

export const getTotalWithVatFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord<Amount>[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.vat / 10 ** item.unitAmount.fractionDigits!),
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
    default:
      return undefined;
  }
};

export const getInvoiceActivityTitle = (type: InvoiceActivityType): string => {
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
      return theme.palette.error.main;
    case InvoiceActivityType.CREATED:
    case InvoiceActivityType.UPDATED:
    case InvoiceActivityType.PRINTED:
      return theme.palette.warning.light;
    default:
      return '';
  }
};
