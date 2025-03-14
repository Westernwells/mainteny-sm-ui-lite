import {DiscountType, InvoiceItemRecord} from 'models/invoice';
import {
  QUOTATION_STATUS_FILTER,
  QuotationActivityType,
  QuotationActivityView,
  QuotationFormData,
  QuotationItemRecord,
  QuotationItemView,
  QuotationStatus,
  QuotationTableRow,
  QuotationView,
  SearchParameters,
} from 'models/quotation';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {TFunction} from 'i18next';
import capitalize from 'lodash/capitalize';
import {ArticleView} from 'models/article';
import {Currency, PdfGenerationStatus, State} from 'models/misc';
import {ServiceCompanyItem} from 'models/service-company';
import {ElevatorView} from 'models/elevator';
import {PropertyOwnerView} from 'models/propertyManager';
import {InvoiceItemView} from '../models/invoice';
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
          ((item.unitAmount.netAmount ?? 0) /
            10 ** Currencies[item.unitAmount.currency]) *
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

export const transformFormikItems = (
  items: QuotationItemRecord[] | InvoiceItemRecord[],
): QuotationItemView[] | InvoiceItemView[] =>
  items.map((item) => ({
    id: item.id || item.article?.id || '',
    name: item.name,
    description: item.description || '',
    quantity: item.quantity,
    quotationId: '',
    unitAmount: {
      currency: item.unitAmount.currency,
      netAmount: item.unitAmount.netAmount,
      percentageVat: item.unitAmount.percentageVat,
      vats: [
        {
          percentageVat: item.unitAmount.percentageVat || 0,
          vat:
            (item.unitAmount.percentageVat ?? 0 / 100) *
            (item.unitAmount.netAmount ?? 0),
        },
      ],
    },
    additionalInfo: {
      discount: item.discount,
      payment: (item as InvoiceItemRecord).payment,
    },
    article: item.article as ArticleView,
  }));

export const generatePdfQuotation = (
  formikValues: QuotationFormData,
  currentCurrency: Currency,
  subtotalExclVat: number,
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
    netAmount: moneyToCents(currentCurrency.code, subtotalExclVat),
    grossAmount: moneyToCents(
      currentCurrency.code,
      amountAfterGlobalDiscountWithVAT,
    ),
    vats: mappedVats,
  },
  additionalInfo: {
    pdfGenerationStatus: PdfGenerationStatus.GENERATION_REQUIRED,
    discount: formikValues.discount,
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
  items: transformFormikItems(formikValues.items) as QuotationItemView[],
  commentCount: 0,
});
