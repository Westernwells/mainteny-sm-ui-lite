import {InvoiceFormData} from 'models/invoice';

export const formatInvoiceRecord = (value: InvoiceFormData) => ({
  subject: value.subject,
  description: value.description,
  dueDate: value.dueDate,
  issuedDate: value.issuedDate,
  type: value.type,
  items: value.items,
  paymentTerms: value.paymentTerms,
  propertyOwnerId: value.propertyOwnerId,
  serviceCompanyId: value.serviceCompanyId,
  serviceOrderId: value.serviceOrderId,
  paymentInfo: value.paymentInfo,
  shouldSendOut: value.shouldSendOut,
  includeWorkReport: value.includeWorkReport,
  includeCheckList: value.includeCheckList,
  beneficialDetails:
    value.beneficialAddress && value.beneficialName
      ? {
          name: value.beneficialName,
          address: value.beneficialAddress,
        }
      : undefined,
  costCenter: value.costCenter,
  customerSpecificOrderNumber: value.customerSpecificOrderNumber,
});
