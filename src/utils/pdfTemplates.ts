// Utils files for the templates and the previews
import {ServiceOrderView} from 'models/service-order';
import {InvoiceView, InvoicedColumn} from 'models/invoice';
import {QuotationView} from 'models/quotation';

export const getAddressComponentFromInvoice = (invoice?: InvoiceView) => {
  if (!invoice) return;
  return (
    invoice?.additionalInfo?.billingAddress?.component ??
    invoice?.propertyOwner.billingAddress?.component
  );
};

export const getAddressComponentFromServiceOrder = (job?: ServiceOrderView) => {
  if (!job) return;
  return (
    job?.elevator.additionalInfo.billingAddress?.component ?? // specified unit address
    job?.elevator.propertyOwner.billingAddress?.component // customer address fallback
  );
};

export const getAddressComponentFromQuotation = (quotation?: QuotationView) => {
  if (!quotation) return;
  return quotation?.additionalInfo.billingAddress?.component;
};

export const insertNewlines = (str: string = '', chunkSize = 4): string => {
  const regex = new RegExp(`(.{${chunkSize}})`, 'g');
  return str.replace(regex, '$1\n');
};

export const getInvoicedSectionColumns = (
  translate: (key: string) => string,
  currentCurrency?: {symbol?: string},
): InvoicedColumn[] => [
  {name: translate('Invoiced'), align: 'left', width: '30%'},
  {name: translate('Date'), align: 'right', width: '15%'},
  {
    name: `${translate('Total')} (${currentCurrency?.symbol})`,
    align: 'right',
    width: '18%',
  },
  {name: translate('VAT (%)'), align: 'right', width: '7%'},
  {name: translate('VAT'), align: 'right', width: '12%'},
  {
    name: `${translate('Total incl. VAT')} (${currentCurrency?.symbol})`,
    align: 'right',
    width: '20%',
  },
];
