import {InvoiceStatus, InvoiceStatusView} from 'models/invoice';

export const getInvoiceStatusStyles = (
  status: string,
): {
  label: string;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'error.light'
    | 'info'
    | 'success'
    | 'warning'
    | 'warning.light'
    | 'action.active'
    | 'primary.mainLight'
    | 'warning.dark'
    | 'primary.light';
} => {
  switch (status) {
    case InvoiceStatus.PAID:
      return {label: InvoiceStatusView.PAID, color: 'success'};
    case InvoiceStatus.DRAFT:
      return {label: InvoiceStatusView.DRAFT, color: 'action.active'};
    case InvoiceStatus.EXPIRED:
      return {label: InvoiceStatusView.EXPIRED, color: 'error.light'};
    case InvoiceStatus.NOT_PAID:
      return {label: InvoiceStatusView.NOT_PAID, color: 'primary.mainLight'};
    case InvoiceStatus.PARTIALLY_PAID:
      return {label: InvoiceStatusView.PARTIALLY_PAID, color: 'warning.light'};
    case InvoiceStatus.CANCELLED:
      return {label: InvoiceStatusView.CANCELLED, color: 'warning.dark'};
    case InvoiceStatus.CREDITED:
      return {label: InvoiceStatusView.CREDITED, color: 'primary.light'};
    default:
      return {label: '-', color: 'default'};
  }
};
