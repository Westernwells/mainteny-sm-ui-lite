import {isBefore, parseISO, startOfDay} from 'date-fns';
import {InvoiceStatus, InvoiceView} from '../models/invoice';
import {PdfGenerationStatus} from '../models/misc';

export const isDueDateInPast = (invoice: InvoiceView) => {
  if (invoice?.status !== InvoiceStatus.DRAFT) {
    return false;
  }

  const localDueDate = invoice.dueDate as string;
  const dueDateObject = startOfDay(
    parseISO(new Date(localDueDate).toISOString()),
  );
  const todayObject = startOfDay(new Date());

  return isBefore(dueDateObject, todayObject);
};

export const validateDueDate = (invoice: InvoiceView) => {
  if (!invoice.dueDate) {
    return 'Error: A payment due date is required to send the invoice. Please add this information to proceed';
  }

  if (isDueDateInPast(invoice)) {
    return 'The due date for the invoice has expired';
  }
};

interface InvoicePDFStatuses {
  isInvoicePDFGenerated: boolean;
  isWorkReportPDFGenerated: boolean;
  isPDFsGenerated: boolean;
}
export const getInvoicePDFStatuses = (
  invoice: InvoiceView,
): InvoicePDFStatuses => {
  const isInvoicePDFGenerated =
    invoice.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE;

  const isWorkReportPDFGenerated = invoice?.additionalInfo?.includeWorkReport
    ? invoice?.serviceOrder?.additionalInfo.workReportGenerated
    : true;

  return {
    isInvoicePDFGenerated,
    isWorkReportPDFGenerated: !!isWorkReportPDFGenerated,
    isPDFsGenerated: !!isWorkReportPDFGenerated && isInvoicePDFGenerated,
  };
};

export const svgToJpegPng = (
  svgElement: SVGSVGElement,
  callback: (dataURL: string) => void,
  options = {format: 'jpeg', quality: 1},
) => {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const image = new Image();
  image.onload = () => {
    if (!context) return;

    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = options.quality || 1;
    const dataURL = canvas.toDataURL(format, quality);

    callback(dataURL);

    URL.revokeObjectURL(url);
  };

  image.src = url;
};

export const getQrErrorMessage = (qrError: string): string => {
  const dynamicErrorHandlers = [
    {
      regex:
        /The provided IBAN number '([A-Z0-9]+)' is either too long or too short\./,
      staticMessage:
        'The invoice PDF cannot be generated because the provided IBAN number is either too long or too short. This is a limitation of the Swiss QR Code generator.',
    },
    // Add other dynamic error handlers here if needed
  ];

  const errorMessages = {
    'Debtor address must be a maximum of 70 characters.':
      'The invoice PDF cannot be generated because the customer address must be 70 characters or less. This is a limitation of the Swiss QR Code generator.',
    'Creditor address must be a maximum of 70 characters.':
      'The invoice PDF cannot be generated because your billing address must be 70 characters or less. This is a limitation of the Swiss QR Code generator.',
    'Debtor buildingNumber must be a maximum of 16 characters.':
      'The invoice PDF cannot be generated because the address line 2 of your customer must be 16 characters or less. This is a limitation of the Swiss QR Code generator.',
    'Creditor buildingNumber must be a maximum of 16 characters.':
      'The invoice PDF cannot be generated because the address line 2 of your billing address must be 16 characters or less. This is a limitation of the Swiss QR Code generator.',
    'Only CH and LI IBAN numbers are allowed.':
      'The invoice PDF cannot be generated because your IBAN does not match Swiss standard. IBAN must contain CH /LI prefix and 19 numbers. This is a limitation of the Swiss QR Code generator. Please set your IBAN correctly in financial settings.',
    'Currency must be either CHF or EUR.':
      'The invoice PDF cannot be generated because the Swiss QR Code generator only supports EUR and CH currency. Please set your currency correctly in financial settings.',
  } as {[key: string]: string};

  // Check if the error message matches any dynamic error handlers using `find`
  const dynamicHandler = dynamicErrorHandlers.find((handler) =>
    qrError.match(handler.regex),
  );
  if (dynamicHandler) {
    return dynamicHandler.staticMessage;
  }

  // If not a dynamic error, return the corresponding static error message
  return errorMessages[qrError] || qrError;
};
