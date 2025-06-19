import {Discount, DiscountType, InvoiceItemRecord} from 'models/invoice';
import {
  EditableQuotationItem,
  QUOTATION_STATUS_FILTER,
  QuotationActivityType,
  QuotationActivityView,
  QuotationFormData,
  QuotationItemRecord,
  QuotationItemView,
  QuotationStatistics,
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
import {VatView} from 'models/vat';
import {dateToString, resolveVatFromBackend} from './utils';
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
  taxRates?: VatView[],
  subItemsMap: Record<string, QuotationSubItemRecord[]> = {},
): EditableQuotationItem => {
  const {percentageVat, vatName} = resolveVatFromBackend(
    quotationItem.unitAmount?.vatId,
    quotationItem.unitAmount?.percentageVat,
    quotationItem.unitAmount?.vatName,
    taxRates,
  );

  const {percentageVat: purchaseVat, vatName: purchaseVatName} =
    resolveVatFromBackend(
      quotationItem.unitPurchaseAmount?.vatId,
      quotationItem.unitPurchaseAmount?.percentageVat,
      quotationItem.unitPurchaseAmount?.vatName,
      taxRates,
    );

  const {percentageVat: articleSellingVat, vatName: articleSellingVatName} =
    resolveVatFromBackend(
      quotationItem.article?.unitSellingAmount?.vatId,
      quotationItem.article?.unitSellingAmount?.percentageVat,
      quotationItem.article?.unitSellingAmount?.vatName,
      taxRates,
    );

  const {percentageVat: articlePurchaseVat, vatName: articlePurchaseVatName} =
    resolveVatFromBackend(
      quotationItem.article?.unitPurchaseAmount?.vatId,
      quotationItem.article?.unitPurchaseAmount?.percentageVat,
      quotationItem.article?.unitPurchaseAmount?.vatName,
      taxRates,
    );

  const record: EditableQuotationItem = {
    id: quotationItem.id,
    article: {
      ...quotationItem.article,
      unitSellingAmount: {
        ...quotationItem.article?.unitSellingAmount,
        currency: quotationItem?.article?.unitSellingAmount?.currency!,
        percentageVat: articleSellingVat,
        vatName: articleSellingVatName,
      },
      unitPurchaseAmount: {
        ...quotationItem.article?.unitPurchaseAmount,
        currency: quotationItem?.article?.unitPurchaseAmount?.currency!,
        percentageVat: articlePurchaseVat,
        vatName: articlePurchaseVatName,
      },
    },
    name: quotationItem.name,
    description: quotationItem.description,
    quantity: quotationItem.quantity,
    unitAmount: {
      ...quotationItem.unitAmount,
      currency: quotationItem?.unitAmount?.currency!,
      percentageVat,
      vatName,
    },
    unitPurchaseAmount: {
      ...quotationItem.unitPurchaseAmount,
      currency: quotationItem?.unitPurchaseAmount?.currency!,
      percentageVat: purchaseVat,
      vatName: purchaseVatName,
    },
    discount: getDiscoutObj(quotationItem.additionalInfo?.discount),
    userSeqNumber: quotationItem?.additionalInfo?.userSeqNumber,
  };

  // If the article's type is PACKAGE, add a default costPackage if it doesn't exist.
  if (quotationItem.article?.type === ArticleType.PACKAGE) {
    if (!quotationItem.article.costPackage) {
      record.article = {
        ...record.article,
        costPackage: {
          laborPercentage: 50,
          materialPercentage: 50,
        },
      };
    }
  }

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
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    });
  }

  if (discount.percentage && discount.percentage > 0) {
    return `${discount.percentage}%`;
  }

  return '-';
};

export const buildQuotationPayload = (
  items: EditableQuotationItem[],
  currentCurrency: Currency,
  discount?: Discount,
  taxRates?: VatView[],
  mode: 'view' | 'edit' = 'view',
) => ({
  currency: currentCurrency.code,
  items: items.map((item) => {
    const {percentageVat, vatName} = resolveVatFromBackend(
      item.unitAmount?.vatId,
      item.unitAmount?.percentageVat,
      item.unitAmount?.vatName,
      taxRates,
    );

    const {percentageVat: purchaseVat, vatName: purchaseVatName} =
      resolveVatFromBackend(
        item.article?.unitPurchaseAmount?.vatId,
        item.article?.unitPurchaseAmount?.percentageVat,
        item.article?.unitPurchaseAmount?.vatName,
        taxRates,
      );

    const {percentageVat: sellingVat, vatName: sellingVatName} =
      resolveVatFromBackend(
        item.article?.unitSellingAmount?.vatId,
        item.article?.unitSellingAmount?.percentageVat,
        item.article?.unitSellingAmount?.vatName,
        taxRates,
      );

    return {
      id: undefined,
      article: {
        id: undefined,
        name: item.article?.name,
        externalId: item.article?.externalId,
        type: item.article?.type,
        unit: item.article?.unit,
        unitSellingAmount: {
          ...item.article?.unitSellingAmount,
          currency:
            item.article?.unitSellingAmount?.currency || currentCurrency.code,
          percentageVat: sellingVat,
          vatName: sellingVatName,
        },
        unitPurchaseAmount: {
          ...item.article?.unitPurchaseAmount,
          currency:
            item.article?.unitPurchaseAmount?.currency || currentCurrency.code,
          percentageVat: purchaseVat,
          vatName: purchaseVatName,
        },
        costPackage: item.article?.costPackage,
      },
      name: item.name,
      description: item.description,
      unitAmount: {
        currency: item.unitAmount?.currency || currentCurrency.code,
        netAmount: Number(item.unitAmount?.netAmount) || 0,
        percentageVat,
        vatId: item.unitAmount?.vatId || '',
        vatName,
      },
      quantity: Number.isNaN(Number(item.quantity)) ? 0 : Number(item.quantity),
      discount:
        item.discount?.type === DiscountType.AMOUNT
          ? {
              type: DiscountType.AMOUNT,
              amount: {
                ...item.discount?.amount,
                value: (item.discount?.amount?.value ?? 0) * 100,
                currency:
                  item.discount?.amount?.currency || currentCurrency.code,
              },
            }
          : {
              type: DiscountType.PERCENTAGE,
              percentage: item.discount?.percentage || 0,
            },
      payment: undefined,
      subItemsConfig: item.subItemsConfig,
      subItems: item?.subItems?.map((sub) => {
        const {percentageVat: subPercentageVat, vatName: subVatName} =
          resolveVatFromBackend(
            sub.unitAmount?.vatId,
            sub.unitAmount?.percentageVat,
            sub.unitAmount?.vatName,
            taxRates,
          );

        const {
          percentageVat: subArticlePurchaseVat,
          vatName: subArticlePurchaseVatName,
        } = resolveVatFromBackend(
          sub.article?.unitPurchaseAmount?.vatId,
          sub.article?.unitPurchaseAmount?.percentageVat,
          sub.article?.unitPurchaseAmount?.vatName,
          taxRates,
        );

        const {percentageVat: subPurchaseVat, vatName: subPurchaseVatName} =
          resolveVatFromBackend(
            sub?.unitPurchaseAmount?.vatId,
            sub?.unitPurchaseAmount?.percentageVat,
            sub?.unitPurchaseAmount?.vatName,
            taxRates,
          );

        const {percentageVat: subSellingVat, vatName: subSellingVatName} =
          resolveVatFromBackend(
            sub.article?.unitSellingAmount?.vatId,
            sub.article?.unitSellingAmount?.percentageVat,
            sub.article?.unitSellingAmount?.vatName,
            taxRates,
          );
        return {
          article: {
            id: undefined,
            name: sub.article?.name,
            externalId: sub.article?.externalId,
            type: sub.article?.type,
            unit: sub.article?.unit,
            unitSellingAmount: {
              ...sub.article?.unitSellingAmount,
              currency:
                sub.article?.unitSellingAmount?.currency ||
                currentCurrency.code,
              percentageVat: subSellingVat,
              vatName: subSellingVatName,
            },
            unitPurchaseAmount: {
              ...sub.article?.unitPurchaseAmount,
              currency:
                sub.article?.unitPurchaseAmount?.currency ||
                currentCurrency.code,
              percentageVat: subArticlePurchaseVat,
              vatName: subArticlePurchaseVatName,
            },
            costPackage: sub.article?.costPackage,
          },
          id: undefined,
          name: sub.name,
          unitPurchaseAmount: {
            ...sub.unitPurchaseAmount,
            currency: sub?.unitPurchaseAmount?.currency || currentCurrency.code,
            percentageVat: subPurchaseVat,
            vatName: subPurchaseVatName,
          },
          unitAmount: {
            ...sub.unitAmount,
            currency: sub.unitAmount?.currency || currentCurrency.code,
            percentageVat: subPercentageVat,
            vatName: subVatName,
          },
          quantity: Number.isNaN(Number(sub.quantity))
            ? 0
            : Number(sub.quantity),
          description: sub.description,
          userSeqNumber: sub.userSeqNumber,
        };
      }),
      userSeqNumber: item.userSeqNumber,
    };
  }),
  globalDiscount:
    discount?.type === DiscountType.AMOUNT
      ? {
          type: DiscountType.AMOUNT,
          amount: {
            value:
              mode === 'view'
                ? discount.amount?.value ?? 0
                : moneyToCents(
                    currentCurrency?.code,
                    discount.amount?.value ?? 0,
                  ),
            currency: discount.amount?.currency || currentCurrency.code,
            fractionDigits:
              discount.amount?.fractionDigits || currentCurrency.fractionDigits,
          },
        }
      : {
          type: DiscountType.PERCENTAGE,
          percentage: discount?.percentage || 0,
        },
});

export const aggregateQuotationStatistics = (
  currency: Currency,
  quotationStatistics?: QuotationStatistics,
) => {
  const CURRENCY = currency.code;
  const numOfQuotationsPerStatus =
    quotationStatistics?.numOfQuotationsPerStatus ?? {};
  const noOfSentStatus =
    numOfQuotationsPerStatus[QuotationStatus.SENT_TO_CLIENT] ?? 0;

  const amountsPerStatus = quotationStatistics?.amountsPerStatus ?? {};

  const sentQuotationAmount =
    amountsPerStatus[QuotationStatus.SENT_TO_CLIENT]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const acceptedQuotationAmount =
    amountsPerStatus[QuotationStatus.ACCEPTED]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;
  const rejectedQuotationAmount =
    amountsPerStatus[QuotationStatus.REJECTED]?.find(
      (item) => item.currency === CURRENCY,
    )?.value ?? 0;

  const statusesCount = {
    total: noOfSentStatus,
  };
  const statusesAmount = {
    total:
      sentQuotationAmount + acceptedQuotationAmount + rejectedQuotationAmount,
    accepted: acceptedQuotationAmount,
    pending: sentQuotationAmount,
  };

  return {statusesCount, statusesAmount};
};
