import {Discount, DiscountType, InvoiceItemRecord} from 'models/invoice';
import {
  EditableQuotationItem,
  QUOTATION_STATUS_FILTER,
  QuotationActivityType,
  QuotationActivityView,
  QuotationFormData,
  QuotationItemRecord,
  QuotationItemView,
  QuotationStatus,
  QuotationSubItemRecord,
  QuotationTableRow,
  QuotationView,
  SearchParameters,
} from 'models/quotation';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {TFunction} from 'i18next';
import capitalize from 'lodash/capitalize';
import {ArticleType, ArticleView} from 'models/article';
import {Currency, PdfGenerationStatus, State} from 'models/misc';
import {ServiceCompanyItem} from 'models/service-company';
import {ElevatorView} from 'models/elevator';
import {PropertyOwnerView} from 'models/propertyManager';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {dateToString} from './utils';
import {Currencies, formatCurrency, moneyToCents} from './currency';

export const getQuotationActivityTitle = (
  activity: QuotationActivityView,
  t: TFunction,
): string => {
  switch (activity.type) {
    case QuotationActivityType.CREATED:
      return activity?.meta.creator
        ? t('Quotation created by {{name}}', {
            name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
          })
        : t('Quotation created by System');
    case QuotationActivityType.UPDATED:
      return activity?.meta.creator
        ? t('Quotation updated by {{name}}', {
            name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
          })
        : t('Quotation updated by System');
    case QuotationActivityType.SENT:
      return t('Quotation sent');
    case QuotationActivityType.ACCEPTED:
      return t('Quotation accepted');
    case QuotationActivityType.REJECTED:
      return t('Quotation rejected');
    case QuotationActivityType.SERVICE_ORDER_ADDED:
      return t('Service Job added');
    case QuotationActivityType.SERVICE_ORDER_REMOVED:
      return t('Service Job removed');
    case QuotationActivityType.PRINTED:
      return t('Quotation printed');
    default:
      return '';
  }
};

export const calculateQuotationTotalWithPerItemDiscount = (
  quotationItems: QuotationItemRecord[],
) => {
  const sum = quotationItems
    ?.map((item: QuotationItemRecord) =>
      applyDiscount({
        actualValue:
          ((item.unitAmount?.netAmount ?? 0) /
            10 ** Currencies[item.unitAmount!.currency]) *
          item.quantity,
        ...(item.discount?.type === DiscountType.AMOUNT
          ? {amount: item.discount?.amount?.value ?? 0}
          : {percentage: item.discount?.percentage ?? 0}),
      }),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  return sum;
};

export const getStatusString = (status: QuotationStatus) => {
  if (status === QuotationStatus.SENT_TO_CLIENT) return 'Sent';

  return status && capitalize(status).replace(/_/g, ' ');
};

export const aggregateQuotationRow = (
  quotations: QuotationView[],
): QuotationTableRow[] =>
  quotations.map((quotation) => ({
    data: quotation,
    id: quotation.id,
    number: quotation.externalId,
    propertyOwner: quotation.propertyOwner,
    createdDate: quotation.meta.createdAt,
    subject: quotation.subject,
    status: quotation.status,
    amount: `${formatCurrency(
      quotation
        ? (quotation.totalAmount.netAmount ?? 0) /
            10 ** quotation.totalAmount.fractionDigits!
        : 0,
      {
        currency: quotation.totalAmount.currency,
      },
    )}`,
    hasComments: !!quotation.commentCount,
  }));

export const createSearchQuery = ({
  search,
  quotationNumber,
}: SearchParameters) => {
  const elements: string[] = [];
  if (search) elements.push(search);
  if (quotationNumber) elements.push(`[externalid:*${quotationNumber}*]`);

  return elements.length ? elements.join(' ') : undefined;
};

export const mapFilterOptionToStatus = (
  option: QUOTATION_STATUS_FILTER,
): QuotationStatus => {
  if (option === QUOTATION_STATUS_FILTER.SENT)
    return QuotationStatus.SENT_TO_CLIENT;

  return option as unknown as QuotationStatus;
};

export const mapStatusToFilterOptions = (
  status: QuotationStatus,
): QUOTATION_STATUS_FILTER => {
  if (status === QuotationStatus.SENT_TO_CLIENT)
    return QUOTATION_STATUS_FILTER.SENT;

  return status as unknown as QUOTATION_STATUS_FILTER;
};

export const transformQuotationFormItems = (
  items: EditableQuotationItem[],
): QuotationItemView[] =>
  items.map((item) => ({
    id: item?.id || item.article?.id || '',
    name: item.name,
    description: item.description || '',
    quantity: item.quantity,
    quotationId: '',
    unitAmount: {
      currency: item.unitAmount!.currency,
      netAmount: item.unitAmount?.netAmount,
      percentageVat: item.unitAmount?.percentageVat,
      vats: [
        {
          percentageVat: item.unitAmount?.percentageVat || 0,
          vat:
            (item.unitAmount?.percentageVat ?? 0 / 100) *
            ((item.unitAmount?.netAmount ?? 0) / 100),
        },
      ],
    },
    additionalInfo: {
      discount: {
        ...item.discount,
        type: item.discount?.type!,
        amount: {
          ...item.discount?.amount,
          value: moneyToCents(
            item.unitAmount!.currency,
            item.discount?.amount?.value,
          ),
          currency: item.discount?.amount?.currency!,
        },
      },
      payment: (item as InvoiceItemRecord).payment,
    },
    article: item.article as ArticleView,
  }));

export const generatePdfQuotation = (
  formikValues: QuotationFormData,
  currentCurrency: Currency,
  amountAfterGlobalDiscount: number,
  amountAfterGlobalDiscountWithVAT: number,
  mappedVats: {
    vat: number;
    percentageVat: number;
  }[],
  unit: ElevatorView | null,
  customer?: PropertyOwnerView,
  company?: ServiceCompanyItem,
): QuotationView => ({
  id: '',
  serviceCompany: {
    id: company?.id ?? '',
    name: company?.name ?? '',
    meta: company?.meta!,
  },
  elevator: unit!,
  number: formikValues.externalId ?? '',
  externalId: formikValues.externalId ?? '',
  description: formikValues.description ?? '',
  propertyOwner: customer!,
  subject: formikValues.subject ?? '',
  moreInfo: formikValues.moreInfo ?? '',
  status: QuotationStatus.DRAFT,
  totalAmount: {
    currency: currentCurrency.code,
    fractionDigits: currentCurrency.fractionDigits,
    netAmount: moneyToCents(currentCurrency.code, amountAfterGlobalDiscount),
    grossAmount: moneyToCents(
      currentCurrency.code,
      amountAfterGlobalDiscountWithVAT,
    ),
    vats: mappedVats,
  },
  additionalInfo: {
    pdfGenerationStatus: PdfGenerationStatus.GENERATION_REQUIRED,
    discount: {
      ...formikValues.discount,
      type: formikValues.discount?.type!,
      amount: {
        ...formikValues.discount?.amount,
        value: moneyToCents(
          formikValues.discount?.amount?.currency!,
          formikValues.discount?.amount?.value,
        ),
        currency: formikValues.discount?.amount?.currency!,
      },
    },
    billingAddress: formikValues.billingAddress,
    beneficiaryAddress: formikValues.beneficiaryAddress,
    alternativeAddress: formikValues.alternativeAddress,
    paymentTerms: formikValues.paymentTerms,
    notes: formikValues.notes ?? '',
    sentDate: formikValues.sentDate ? dateToString(formikValues.sentDate) : '',
    expiryDate: formikValues.expiryDate
      ? dateToString(formikValues.expiryDate)
      : '',
    referenceNumber: formikValues.referenceNumber ?? '',
    alternativeServiceCompanyInfo: {
      name: formikValues.alternativeServiceCompanyInfo?.name ?? '',
      address: formikValues.alternativeServiceCompanyInfo?.address,
    },
  },
  search: '',
  meta: {
    createdAt: Date.now().toString(),
    lastUpdatedAt: Date.now().toString(),
    state: State.ACTIVE,
  },
  items: transformQuotationFormItems(formikValues.items) as QuotationItemView[],
  commentCount: 0,
});

export const quotationItemToQuotationItemRecord = (
  quotationItem: QuotationItemView,
  subItemsMap: Record<string, QuotationSubItemRecord[]> = {},
): EditableQuotationItem => {
  const record: EditableQuotationItem = {
    id: quotationItem.id,
    article: quotationItem.article,
    name: quotationItem.name,
    description: quotationItem.description,
    quantity: quotationItem.quantity,
    unitAmount: quotationItem.unitAmount,
    unitPurchaseAmount: quotationItem.unitPurchaseAmount,
    discount: getDiscoutObj(quotationItem.additionalInfo?.discount),
    userSeqNumber: quotationItem?.additionalInfo?.userSeqNumber,
  };

  if (quotationItem.article?.type === ArticleType.MIX) {
    const subItems = subItemsMap[quotationItem.id] || [];

    return {
      ...record,
      subItems: subItems.map((subItem) => ({
        parentId: quotationItem.id,
        id: subItem?.id || '',
        article: subItem.article,
        name: subItem.name,
        description: subItem.description,
        quantity: subItem.quantity,
        unitAmount: subItem.unitAmount,
        unitPurchaseAmount: subItem.unitPurchaseAmount,
        userSeqNumber: subItem.userSeqNumber,
      })),
      subItemsConfig: {
        subItemsVisible:
          quotationItem.additionalInfo.subItemsConfig?.subItemsVisible || false,
        priceVisible:
          quotationItem.additionalInfo.subItemsConfig?.priceVisible || false,
      },
    };
  }

  return record;
};

export const getQuotationItemTotalAfterPerItemDiscount = ({
  positionItem,
}: {
  positionItem: EditableQuotationItem;
}): number => {
  const quantity = positionItem.quantity || 0;
  const netAmount = positionItem.unitAmount?.netAmount || 0;

  const {discount} = positionItem;

  let total = (netAmount * quantity) / 100;

  if (discount?.type === DiscountType.PERCENTAGE) {
    total -= (total * (discount.percentage || 0)) / 100;
  } else if (discount?.type === DiscountType.AMOUNT) {
    total -= discount.amount?.value || 0;
  }

  return Math.max(total, 0);
};

export const getDiscountDisplay = (
  discount?: Discount,
  currentCurrency?: Currency,
  selectedLng?: string,
) => {
  if (!discount) {
    return '-';
  }

  if (discount.type === DiscountType.AMOUNT) {
    return formatCurrency(discount.amount?.value || 0, {
      currency: currentCurrency?.code,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });
  }

  if (discount.percentage && discount.percentage > 0) {
    return `${discount.percentage}%`;
  }

  return '-';
};
