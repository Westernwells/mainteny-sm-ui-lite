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
    invoice.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    !!invoice.additionalInfo.pdfPath;
  const isWorkReportPDFGenerated = invoice?.additionalInfo?.includeWorkReport
    ? invoice?.serviceOrder?.additionalInfo.workReportGenerated
    : true;

  return {
    isInvoicePDFGenerated,
    isWorkReportPDFGenerated: !!isWorkReportPDFGenerated,
    isPDFsGenerated: !!isWorkReportPDFGenerated && isInvoicePDFGenerated,
  };
};
