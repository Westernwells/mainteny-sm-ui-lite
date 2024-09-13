import {InvoiceFormat} from 'models/propertyManager';

export const ONE_KB_IN_BYTES = 1024;
export const ONE_MB_IN_BYTES = ONE_KB_IN_BYTES * 1024;
export const IMAGE_SIZE_IN_MB = 500_000; // 0.5MB

export const CUSTOMER_ALL_INVOICE_FORMATS = [
  {
    label: 'PDF',
    value: InvoiceFormat.PDF,
  },
  {
    label: 'Xinvoice (XML)',
    value: InvoiceFormat.XML,
  },
  {
    label: 'PDF & Xinvoice (XML)',
    value: InvoiceFormat.PDF_AND_XML,
  },
];
