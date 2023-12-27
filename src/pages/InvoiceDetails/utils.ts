import {CreateInvoice, InvoiceFormData, UpdateInvoice} from 'models/invoice';

export const formatInvoiceRecord = (
  value: InvoiceFormData,
): CreateInvoice | UpdateInvoice => ({
  subject: value.subject,
  description: value.description,
  dueDate: value.dueDate,
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
  costCenter: value.costCenter,
  customerSpecificOrderNumber: value.customerSpecificOrderNumber,
  moreInfo: value.moreInfo,
  billingAddress: value.billingAddress,
  beneficiaryAddress: value.beneficiaryAddress,
  alternativeAddress: value.alternativeAddress,
  externalId: value.externalId,
  laborMaterialCosts: value.laborMaterialCosts,
  laborMaterialCostText: value.laborMaterialCostText,
});

export const applyDiscount = ({
  actualValue,
  percentage,
  amount,
}: {
  actualValue: number;
  percentage?: number;
  amount?: number;
}) => {
  // if (percentage < 0 || percentage > 100) {
  //   return 'Please provide valid inputs: a percentage between 0 and 100.';
  // }

  if (!percentage && !amount) {
    return actualValue;
  }

  // const discountAmount = (actualValue * percentage) / 100;
  const discountAmount =
    amount || (percentage ? (actualValue * percentage) / 100 : 0);
  const discountedPrice = actualValue - discountAmount;

  return discountedPrice;
};
