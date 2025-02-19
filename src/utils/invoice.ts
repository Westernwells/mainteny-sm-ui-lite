import useTheme from '@mui/material/styles/useTheme';
import {t} from 'i18next';
import {
  AggregatedAmount,
  InvoiceActivityType,
  InvoiceActivityView,
  InvoiceAmountDetail,
  InvoiceFormData,
  InvoiceItemView,
  InvoiceItemRecord,
  InvoicePaymentTermRecord,
  InvoiceStatus,
  InvoiceStatusView,
  InvoiceTableRow,
  InvoiceTypeMap,
  InvoiceView,
  MyInvoiceActivityView,
  Payment,
  SearchParameters,
  PaymentType,
} from 'models/invoice';
import {QuotationItemRecord} from 'models/quotation';
import {addDays} from 'date-fns';
import {PaymentTermArticleType, PaymentTermData} from 'models/contract';
import {Currency, PdfGenerationStatus, State} from 'models/misc';
import {ArticleType} from 'models/article';
import {ServiceOrderTypeRecord, ServiceOrderView} from 'models/service-order';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {ServiceCompanyItem} from 'models/service-company';
import {
  centsToMoney,
  convertNumberToAmountNumber,
  Currencies,
  formatCurrency,
  moneyToCents,
} from './currency';
import {dateToString, getAmountFromPercentage} from './utils';
import {formatDate} from './datetime';
import {getJobTypeGivenName} from './service-order-utils';
import {transformFormikItems} from './quotation';

export const getTotalFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        ((item.unitAmount.netAmount ?? 0) /
          10 ** Currencies[item.unitAmount.currency]),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

export const getTotalWithVatFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (getAmountFromPercentage(
          item.unitAmount.percentageVat ?? 0,
          item.unitAmount.netAmount ?? 0,
        ) /
          10 ** Currencies[item.unitAmount.currency]),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

export const mapInvoiceStatus = (invoiceStatus: InvoiceStatusView) => {
  switch (invoiceStatus) {
    case InvoiceStatusView.PAID:
      return InvoiceStatus.PAID;
    case InvoiceStatusView.NOT_PAID:
      return InvoiceStatus.NOT_PAID;
    case InvoiceStatusView.DRAFT:
      return InvoiceStatus.DRAFT;
    case InvoiceStatusView.EXPIRED:
      return InvoiceStatus.EXPIRED;
    case InvoiceStatusView.PARTIALLY_PAID:
      return InvoiceStatus.PARTIALLY_PAID;
    case InvoiceStatusView.CANCELLED:
      return InvoiceStatus.CANCELLED;
    case InvoiceStatusView.CREDITED:
      return InvoiceStatus.CREDITED;
    default:
      return InvoiceStatus.DRAFT;
  }
};

export const getInvoiceActivityTitle = (
  type: InvoiceActivityType,
  activity?: MyInvoiceActivityView,
): string => {
  switch (type) {
    case InvoiceActivityType.CREATED:
      return activity?.meta.creator
        ? t('Invoice created by {{name}}', {
            name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
          })
        : t('Invoice created by System');
    case InvoiceActivityType.UPDATED:
      return activity?.meta.creator
        ? t('Invoice updated by {{name}}', {
            name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
          })
        : t('Invoice updated by System');
    case InvoiceActivityType.SENT:
      return 'Invoice sent';
    case InvoiceActivityType.PRINTED:
      return 'Invoice printed';
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return 'Overdue notice sent';
    case InvoiceActivityType.CANCELLED:
      return 'Invoice cancelled';
    case InvoiceActivityType.UNCANCELLED:
      return t('Invoice restored by {{name}}', {
        name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
      });
    case InvoiceActivityType.PAID:
      return 'Invoice paid';
    case InvoiceActivityType.EXPIRED:
      return 'Invoice overdue';
    case InvoiceActivityType.PAYMENT_RECEIVED:
      return t(`Payment of {{amount}} received`, {
        amount: activity?.amount,
      });
    case InvoiceActivityType.PAYMENT_UPDATED:
      return 'Payment updated';
    case InvoiceActivityType.PAYMENT_DELETED:
      return 'Payment deleted';
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return 'Invoice not sent';
    case InvoiceActivityType.INVOICE_EMAIL_DELIVERED:
      return 'Invoice delivered';
    case InvoiceActivityType.OVERDUE_NOTICE_EMAIL_DELIVERED:
      return 'Overdue notice delivered';
    default:
      return '';
  }
};

export const getInvoiceActivityDescription = (
  activity: InvoiceActivityView,
  invoice: InvoiceView,
): string => {
  const invoiceNumber = invoice.externalId ?? '';
  const creatorInfo =
    activity.meta.creator?.firstName ||
    activity.meta.creator?.lastName ||
    activity.meta.creator?.username;

  const creatorFullName =
    activity.meta.creator?.firstName && activity.meta.creator?.lastName
      ? `${activity.meta.creator?.firstName} ${activity.meta.creator?.lastName}`
      : null;

  switch (activity.type) {
    case InvoiceActivityType.SENT:
      return t(
        `Sending invoice {{invoiceNumber}} to {{receiverEmail}} by {{senderName}}`,
        {
          senderName: creatorFullName ?? creatorInfo,
          receiverEmail: JSON.parse(activity.data).email || '',
          invoiceNumber,
        },
      );
    case InvoiceActivityType.INVOICE_EMAIL_DELIVERED ||
      InvoiceActivityType.OVERDUE_NOTICE_EMAIL_DELIVERED:
      return t(`The email was successfully delivered to {{receiverEmail}}`, {
        receiverEmail: JSON.parse(activity.data).receivers.join(', ') || '',
      });
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return t(
        `Email with {{invoiceDetails}} ${
          creatorInfo ? `by {{creator}}` : ''
        } to {{email}} not delivered`,
        {
          creator: creatorInfo,
          email: JSON.parse(activity.data).receivers[0] || '',
          invoiceDetails: invoiceNumber,
        },
      );
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return t(
        `Sending overdue notice {{invoiceNumber}} to {{receiverEmail}} by {{senderName}}`,
        {
          senderName: creatorFullName ?? creatorInfo,
          receiverEmail: JSON.parse(activity.data).email || '',
          invoiceNumber,
        },
      );
    default:
      return '';
  }
};

export const invoiceStatusToString = (type: InvoiceActivityType): string => {
  switch (type) {
    case InvoiceActivityType.SENT:
      return 'Invoice sent';
    case InvoiceActivityType.PRINTED:
      return 'Invoice printed';
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return 'Overdue notice sent';
    case InvoiceActivityType.CANCELLED:
      return 'Invoice cancelled';
    case InvoiceActivityType.PAID:
      return 'Invoice paid';
    case InvoiceActivityType.EXPIRED:
      return 'Invoice overdue';
    case InvoiceActivityType.PAYMENT_RECEIVED:
      return 'Payment received';
    case InvoiceActivityType.PAYMENT_UPDATED:
      return 'Payment updated';
    case InvoiceActivityType.PAYMENT_DELETED:
      return 'Payment deleted';
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return 'Invoice not sent';
    default:
      return '';
  }
};

export const getInvoiceActivityColor = (type: InvoiceActivityType): string => {
  const theme = useTheme();
  switch (type) {
    case InvoiceActivityType.SENT:
      return theme.palette.primary.main;
    case InvoiceActivityType.OVERDUE_NOTICE_SENT:
      return theme.palette.warning.main;
    case InvoiceActivityType.PAID:
    case InvoiceActivityType.PAYMENT_RECEIVED:
    case InvoiceActivityType.PAYMENT_UPDATED:
      return theme.palette.success.main;
    case InvoiceActivityType.EXPIRED:
    case InvoiceActivityType.PAYMENT_DELETED:
    case InvoiceActivityType.INVOICE_EMAIL_SENT_FAILED:
      return theme.palette.error.main;
    case InvoiceActivityType.CREATED:
    case InvoiceActivityType.UPDATED:
    case InvoiceActivityType.PRINTED:
      return theme.palette.warning.light;
    default:
      return '';
  }
};

export const getFormattedPaymentValues = (
  paymentTerm: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  },
  invoice: InvoiceView,
  invoiceAmountDetail: InvoiceAmountDetail,
  grossInvoiceAmount: number,
  currentCurrency?: Currency,
) => {
  const discountValues = paymentTerm?.data?.discountOptions?.map((d) => {
    const dueDate = addDays(
      invoice.sentDate ? new Date(invoice.sentDate) : new Date(),
      d.discountDays || 0,
    );
    const formattedDueDate = formatDate(dueDate);

    let filteredItems: InvoiceItemView[] = [];
    if (d.articleType === PaymentTermArticleType.LABOR) {
      filteredItems = invoice?.items?.filter(
        (item) =>
          item.article?.type === ArticleType.LABOR ||
          item.article?.type === ArticleType.PACKAGE,
      );
    } else if (d.articleType === PaymentTermArticleType.MATERIAL) {
      filteredItems = invoice?.items?.filter(
        (item) =>
          item.article?.type === ArticleType.MATERIAL ||
          item.article?.type === ArticleType.PACKAGE,
      );
    } else if (d.articleType === PaymentTermArticleType.ALL) {
      filteredItems = invoice?.items;
    }

    const filteredItemDetails = filteredItems?.map((item) =>
      invoiceAmountDetail?.items?.find(
        (_detailItem, index) => index === invoice?.items.indexOf(item),
      ),
    );

    // Calculate the total gross amount for the filtered items (including PACKAGE split for LABOR and MATERIAL)
    const totalAmountAfterGlobalDiscount = filteredItemDetails?.reduce(
      (sum, itemDetail, index) => {
        const item = filteredItems[index];

        if (
          item?.article?.type === ArticleType.PACKAGE &&
          d.articleType !== PaymentTermArticleType.ALL
        ) {
          // Apply percentage split only for LABOR or MATERIAL, not for ALL
          const percentage =
            d.articleType === PaymentTermArticleType.LABOR
              ? item.article?.costPackage?.laborPercentage
              : item.article?.costPackage?.materialPercentage;

          return (
            sum +
            ((itemDetail?.amountAfterGlobalDiscount?.grossAmount || 0) *
              (percentage || 0)) /
              100
          );
        }

        return sum + (itemDetail?.amountAfterGlobalDiscount?.grossAmount || 0);
      },
      0,
    );

    const invoiceAmount = centsToMoney(
      currentCurrency?.code!,
      totalAmountAfterGlobalDiscount,
    );

    // Apply the discount percentage to the total gross amount
    const discountPercentage = d.discountPercent || 0;
    const discountAmount = invoiceAmount * (discountPercentage / 100);

    const paymentAmount = grossInvoiceAmount - discountAmount;

    return {
      formattedDueDate,
      discountAmount,
      invoiceAmount,
      paymentAmount,
    };
  });

  return discountValues;
};

export const replacePaymentTermsPlaceholders = (
  template: string,
  replacements: {
    formattedDueDate?: string;
    discountAmount?: number;
    invoiceAmount?: number;
    paymentAmount?: number;
  }[],
  currentCurrency: Currency,
  selectedLng?: string,
): string => {
  const hasPlaceholders =
    template.includes('{DUE_DATE}') ||
    template.includes('{DISCOUNT_AMOUNT}') ||
    template.includes('{INVOICE_AMOUNT}') ||
    template.includes('{PAYMENT_AMOUNT}');

  if (!hasPlaceholders) {
    return template;
  }

  const sections = template.split('\n');

  let result = `${sections[0]}\n`;

  replacements.forEach((replacement, index) => {
    if (sections[index + 1] && replacement) {
      if (replacement.discountAmount && replacement.discountAmount > 0) {
        let sectionToReplace = sections[index + 1];

        sectionToReplace = sectionToReplace.replace(
          '{DUE_DATE}',
          replacement.formattedDueDate || '',
        );
        sectionToReplace = sectionToReplace.replace(
          '{DISCOUNT_AMOUNT}',
          formatCurrency(replacement.discountAmount || 0, {
            currency: currentCurrency?.code,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          }) || '',
        );
        sectionToReplace = sectionToReplace.replace(
          '{INVOICE_AMOUNT}',
          formatCurrency(replacement.invoiceAmount || 0, {
            currency: currentCurrency?.code,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          }) || '',
        );
        sectionToReplace = sectionToReplace.replace(
          '{PAYMENT_AMOUNT}',
          formatCurrency(replacement.paymentAmount || 0, {
            currency: currentCurrency?.code,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          }) || '',
        );

        result += `${sectionToReplace}\n`;
      }
    }
  });

  return result.trim();
};

export const netTotal = (
  articleItem: InvoiceItemView,
  currencyCode: string,
) => {
  const grossTotal =
    (articleItem.unitAmount?.netAmount ?? 0) * articleItem.quantity;
  const discountValue =
    articleItem?.additionalInfo?.discount?.amount?.value ?? 0;

  return centsToMoney(currencyCode, grossTotal - discountValue);
};

export const getDisplayDeliveryDate = (
  deliveryStartDate?: string,
  deliveryEndDate?: string,
) => {
  const formattedStartDate = deliveryStartDate
    ? formatDate(deliveryStartDate)
    : '';
  const formattedEndDate = deliveryEndDate ? formatDate(deliveryEndDate) : '';

  if (formattedStartDate && formattedEndDate) {
    if (formattedStartDate === formattedEndDate) {
      return formattedStartDate;
    }
    return `${formattedStartDate} - ${formattedEndDate}`;
  }
  return formattedStartDate || formattedEndDate;
};

export const aggregateInvoiceRow = (
  invoices: InvoiceView[],
  jobTypes: ServiceOrderTypeRecord[],
): InvoiceTableRow[] =>
  invoices.map((invoice) => ({
    data: invoice,
    id: invoice.id,
    number: invoice.number,
    propertyOwner: invoice.propertyOwner,
    date: invoice.sentDate,
    dueDate: invoice.dueDate,
    jobNumber: invoice.serviceOrder?.number ?? '-',
    type: InvoiceTypeMap[invoice.type],
    serviceOrderType: getJobTypeGivenName(invoice.serviceOrder?.type, jobTypes),
    total: invoice
      ? (invoice.totalAmount?.grossAmount ?? 0) /
        10 ** invoice.totalAmount.fractionDigits!
      : 0,
    status: invoice.status,
    hasComments: !!invoice.commentCount,
  }));

export const createSearchQuery = ({
  search,
  orderNumber,
  invoiceNumber,
  jobNumber,
}: SearchParameters) => {
  const elements: string[] = [];
  if (search) elements.push(search);
  if (orderNumber) elements.push(`[purchaseorder:*${orderNumber}*]`);
  if (invoiceNumber) elements.push(`[externalid:*${invoiceNumber}*]`);
  if (jobNumber) elements.push(`[so:externalid:*${jobNumber}*]`);

  return elements.length ? elements.join(' ') : undefined;
};

export function transformPropertyOwnerViewToSimpleView(
  propertyOwner?: PropertyOwnerView,
): PropertyOwnerSimpleView {
  return {
    additionalInfo: propertyOwner?.additionalInfo!,
    billingAddress: propertyOwner?.billingAddress,
    beneficiaryAddress: propertyOwner?.beneficiaryAddress,
    otherAddress: propertyOwner?.otherAddress,
    contact: propertyOwner?.contact!,
    id: propertyOwner?.id!,
    labels: propertyOwner?.labels || [],
    meta: propertyOwner?.meta!,
    name: propertyOwner?.name || '',
    serviceCompanyId: propertyOwner?.serviceCompany?.id ?? '',
    externalId: propertyOwner?.externalId || '',
    number: propertyOwner?.number,
  };
}

export const generatePdfInvoice = (
  formikValues: InvoiceFormData,
  currentCurrency: Currency,
  subtotalExclVat: number,
  amountAfterGlobalDiscountWithVAT: number,
  mappedVats: {
    vat: number;
    percentageVat: number;
  }[],
  company?: ServiceCompanyItem,
  serviceOrder?: ServiceOrderView,
  customer?: PropertyOwnerView | null,
  existingInvoice?: InvoiceView,
): InvoiceView => ({
  id: formikValues?.id ?? '',
  number: formikValues.externalId ?? '',
  externalId: formikValues.externalId ?? '',
  description: formikValues.description ?? '',
  subject: formikValues.subject ?? '',
  type: formikValues.type,
  totalAmount: existingInvoice
    ? existingInvoice.totalAmount
    : {
        currency: currentCurrency.code,
        fractionDigits: currentCurrency.fractionDigits,
        netAmount: moneyToCents(currentCurrency.code, subtotalExclVat),
        grossAmount: moneyToCents(
          currentCurrency.code,
          amountAfterGlobalDiscountWithVAT,
        ),
        vats: mappedVats,
      },
  sentDate: formikValues.sentDate ? dateToString(formikValues.sentDate) : '',
  dueDate: formikValues.dueDate ? dateToString(formikValues.dueDate) : '',
  status: InvoiceStatus.DRAFT,
  serviceOrder,
  propertyOwner: transformPropertyOwnerViewToSimpleView(customer!),
  serviceCompany: {
    id: company?.id ?? '',
    name: company?.name ?? '',
    meta: company?.meta!,
  },
  items: transformFormikItems(formikValues.items) as InvoiceItemView[],
  search: '',
  meta: {
    createdAt: Date.now().toString(),
    lastUpdatedAt: Date.now().toString(),
    state: State.ACTIVE,
  },
  additionalInfo: {
    pdfGenerationStatus: PdfGenerationStatus.GENERATION_REQUIRED,
    discount: formikValues.discount,
    billingAddress: formikValues.billingAddress,
    beneficiaryAddress: formikValues.beneficiaryAddress,
    alternativeAddress: formikValues.alternativeAddress,
    alternativeServiceCompanyInfo: formikValues.alternativeServiceCompanyInfo,
    paymentInfo: formikValues.paymentInfo,
    laborMaterialCostText: formikValues.laborMaterialCostText,
    moreInfo: formikValues.moreInfo,
    purchaseOrderNumber: formikValues.purchaseOrderNumber ?? '',
    costCenter: formikValues.costCenter ?? '',
    includeWorkReport: formikValues.includeWorkReport ?? false,
    includeCheckList: formikValues.includeCheckList ?? false,
    payment: {
      ...formikValues.payment,
      amount:
        formikValues.payment?.type === PaymentType.PER_ITEM
          ? undefined
          : {
              currency:
                formikValues.payment?.amount?.currency || currentCurrency.code,
              fractionDigits:
                formikValues.payment?.amount?.fractionDigits ||
                currentCurrency.fractionDigits,
              netAmount: convertNumberToAmountNumber(
                formikValues.payment?.amount?.value ?? 0,
                currentCurrency,
              ),
            },
      percentage:
        formikValues.payment?.type === PaymentType.PER_ITEM
          ? formikValues.payment?.percentage ?? 0
          : undefined,
    } as Payment<AggregatedAmount>,
    deliveryStartDate: formikValues.deliveryStartDate
      ? dateToString(formikValues.deliveryStartDate)
      : '',
    deliveryEndDate: formikValues.deliveryEndDate
      ? dateToString(formikValues.deliveryEndDate)
      : '',
    showArticleSection: formikValues.showArticleSection ?? false,
    showInvoicedSection: formikValues.showInvoicedSection ?? false,
    showPaymentSection: formikValues.showPaymentSection ?? false,
    paymentTerm: formikValues.paymentTerm,
    elevatorExternalId: formikValues.elevatorExternalId,
  },
  overdueNotices: [],
  commentCount: 0,
  payments: [],
});

export const getBalanceAmount = (invoice: InvoiceView) => {
  const totalGross =
    (invoice.totalAmount?.grossAmount ?? 0) /
    10 ** invoice.totalAmount.fractionDigits!;
  const paidSum =
    invoice.payments
      .filter((p) => p.meta?.state === State.ACTIVE)
      .reduce((sum, p) => sum + p.amount.value!, 0) /
    10 ** invoice.totalAmount.fractionDigits!;
  return totalGross - paidSum;
};
