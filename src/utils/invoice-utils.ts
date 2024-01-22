import {isBefore, parseISO, startOfDay} from 'date-fns';
import {InvoiceStatus, InvoiceView} from 'models/invoice';

const isDueDateInPast = (invoice: InvoiceView) => {
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
    return 'The due date is missing for this invoice';
  }

  if (isDueDateInPast(invoice)) {
    return 'The due date for the invoice has expired';
  }
};
