import {
  CreateInvoice,
  InvoiceFormData,
  InvoiceItemRecord,
  UpdateInvoice,
} from 'models/invoice';
import {Amount} from 'models/misc';
import {dateToString} from 'utils/utils';

export const formatInvoiceRecord = (
  value: InvoiceFormData,
): CreateInvoice | UpdateInvoice => ({
  ...value,
  subject: value.subject,
  description: value.description,
  dueDate: value.dueDate ? dateToString(value.dueDate) : '',
  sentDate: value.sentDate ? dateToString(value.sentDate) : '',
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
  deliveryStartDate: value.deliveryStartDate
    ? dateToString(value.deliveryStartDate)
    : '',
  deliveryEndDate: value.deliveryEndDate
    ? dateToString(value.deliveryEndDate)
    : '',
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
  if (!percentage && !amount) {
    return actualValue;
  }

  const discountAmount =
    amount || (percentage ? (actualValue * percentage) / 100 : 0);
  const discountedPrice = actualValue - discountAmount;

  return discountedPrice;
};

export const getAggregatedItemsVats = (
  items: InvoiceItemRecord<Amount>[],
  subtotalExclVatAfterDiscount: number,
) =>
  items.reduce((acc, item) => {
    const {percentageVat} = item.unitAmount;
    const vat = subtotalExclVatAfterDiscount * (percentageVat / 100);

    const existingItemIndex = acc.findIndex(
      (i) => i.percentageVat === percentageVat,
    );

    if (existingItemIndex !== -1) {
      acc[existingItemIndex].vat += vat;
    } else {
      acc.push({percentageVat, vat});
    }

    return acc;
  }, [] as {percentageVat: number; vat: number}[]);
