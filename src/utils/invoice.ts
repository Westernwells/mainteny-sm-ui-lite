import useTheme from '@mui/material/styles/useTheme';
import {t} from 'i18next';
import {
  AggregatedAmount,
  Discount,
  DiscountType,
  EditableInvoiceItem,
  GetInvoiceTimeUnit,
  InvoiceActivityType,
  InvoiceActivityView,
  InvoiceAmountDetail,
  InvoiceFormData,
  InvoiceFrequencyValues,
  InvoiceItemAmount,
  InvoiceItemRecord,
  InvoiceItemView,
  InvoicePaymentTermRecord,
  InvoiceStatus,
  InvoiceStatusView,
  InvoiceSubItemAmount,
  InvoiceSubItemRecord,
  InvoiceTableRow,
  InvoiceType,
  InvoiceTypeMap,
  InvoiceView,
  MyInvoiceActivityView,
  Payment,
  PaymentType,
  SearchParameters,
  VatAmount,
} from 'models/invoice';
import {QuotationItemRecord} from 'models/quotation';
import {addDays} from 'date-fns';
import {
  ContractPaymentTermView,
  ContractTermView,
  ContractTimeUnit,
  PaymentTermArticleType,
  PaymentTermData,
} from 'models/contract';
import {
  AddressRecord,
  Currency,
  Money,
  PdfGenerationStatus,
  State,
} from 'models/misc';
import {ArticleType, ArticleView} from 'models/article';
import {
  ServiceOrderArticleView,
  ServiceOrderTypeRecord,
  ServiceOrderView,
} from 'models/service-order';
import {
  InvoiceFormat,
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {ServiceCompanyItem} from 'models/service-company';
import {getDiscoutObj} from 'pages/QuotationDetails/utils';
import {VatView} from '../models/vat';
import {
  aggregatedAmountToMoney,
  centsToMoney,
  convertNumberToAmountNumber,
  Currencies,
  formatCurrency,
  moneyToCents,
} from './currency';
import {
  dateToString,
  getAmountFromPercentage,
  resolveVatFromBackend,
} from './utils';
import {formatDate} from './datetime';
import {getJobTypeGivenName} from './service-order-utils';

export const getTotalFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        ((item.unitAmount?.netAmount ?? 0) /
          10 ** Currencies[item.unitAmount?.currency!]),
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
          item.unitAmount?.percentageVat ?? 0,
          item.unitAmount?.netAmount ?? 0,
        ) /
          10 ** Currencies[item.unitAmount?.currency!]),
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
    case InvoiceStatusView.OVERDUE_NOTICE_1:
      return InvoiceStatus.OVERDUE_NOTICE_1;
    case InvoiceStatusView.OVERDUE_NOTICE_2:
      return InvoiceStatus.OVERDUE_NOTICE_2;
    case InvoiceStatusView.OVERDUE_NOTICE_3:
      return InvoiceStatus.OVERDUE_NOTICE_3;
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

export const getFormattedPaymentValuesForPartialUpfrontAndFinal = (
  paymentTerm: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  },
  invoice: InvoiceView,
  totalAmount: number,
  currentCurrency?: Currency,
) => {
  const discountValues = paymentTerm?.data?.discountOptions?.map((d) => {
    const dueDate = addDays(
      invoice.sentDate ? new Date(invoice.sentDate) : new Date(),
      d.discountDays || 0,
    );
    const formattedDueDate = formatDate(dueDate);

    let filteredItems: InvoiceItemView[] = [];
    let applicableAmount = totalAmount;

    if (d.articleType !== PaymentTermArticleType.ALL) {
      // Calculate the total sum of all items
      const totalSum = invoice.items?.reduce(
        (sum, item) => sum + (item.unitAmount?.netAmount ?? 0) * item.quantity,
        0,
      );

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
      }

      // Calculate the proportion of filtered items
      const filteredSum = filteredItems?.reduce((sum, item) => {
        const itemAmount = (item.unitAmount?.netAmount ?? 0) * item.quantity;

        if (item?.article?.type === ArticleType.PACKAGE) {
          const percentage =
            d.articleType === PaymentTermArticleType.LABOR
              ? item.article?.costPackage?.laborPercentage
              : item.article?.costPackage?.materialPercentage;

          return sum + (itemAmount * (percentage || 0)) / 100;
        }

        return sum + itemAmount;
      }, 0);

      // Apply the same proportion to totalAmount
      applicableAmount =
        totalSum > 0 ? totalAmount * (filteredSum / totalSum) : 0;
    }

    const invoiceAmount = centsToMoney(
      currentCurrency?.code!,
      applicableAmount,
    );

    // Apply the discount percentage to the filtered total amount
    const discountPercentage = d.discountPercent || 0;
    const discountAmount = invoiceAmount * (discountPercentage / 100);

    const paymentAmount = invoiceAmount - discountAmount;

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
  if (jobNumber) elements.push(`[so.externalid:*${jobNumber}*]`);

  return elements.length ? elements.join(' ') : undefined;
};

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

export function transformPropertyOwnerViewToSimpleView(
  propertyOwner?: PropertyOwnerView,
): PropertyOwnerSimpleView {
  return {
    id: propertyOwner?.id!,
    name: propertyOwner?.name || '',
    number: propertyOwner?.number,
    externalId: propertyOwner?.externalId || '',
    serviceCompanyId: propertyOwner?.serviceCompany?.id ?? '',
    otherAddress: propertyOwner?.otherAddress,
    beneficiaryAddress: propertyOwner?.beneficiaryAddress,
    billingAddress: propertyOwner?.billingAddress,
    businessAddress: propertyOwner?.businessAddress,
    postalAddress: propertyOwner?.postalAddress,
    contact: propertyOwner?.contact!,
    additionalInfo: propertyOwner?.additionalInfo!,
    meta: propertyOwner?.meta!,
  };
}

export const transformFormikItems = (
  items: InvoiceItemRecord[],
): InvoiceItemView[] =>
  items.map((item) => ({
    id: item?.id || item.article?.id || '',
    name: item.name,
    description: item.description || '',
    quantity: item.quantity,
    unitAmount: {
      currency: item.unitAmount!.currency,
      netAmount: item.unitAmount?.netAmount,
      percentageVat: item.unitAmount?.percentageVat,
      vats: [
        {
          percentageVat: item.unitAmount?.percentageVat || 0,
          vat:
            (item.unitAmount?.percentageVat ?? 0 / 100) *
            (item.unitAmount?.netAmount ?? 0),
        },
      ],
    },
    additionalInfo: {
      discount: item.discount,
      payment: item.payment
        ? {
            ...item.payment,
            amount: item.payment.amount ?? {
              currency: item.unitAmount.currency,
              vats: [],
              netAmount: 0,
            },
          }
        : undefined,
    },
    article: item.article as ArticleView,
  }));

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
    discount: {
      ...formikValues.discount,
      type: formikValues.discount?.type!,
      amount: {
        ...formikValues.discount?.amount,
        value: moneyToCents(
          currentCurrency.code,
          formikValues.discount?.amount?.value,
        ),
        currency:
          formikValues.discount?.amount?.currency || currentCurrency.code,
      },
    },
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
        formikValues.payment?.type !== PaymentType.LUMP_SUM
          ? formikValues.payment?.percentage
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

export const getInvoiceStatusStyles = (
  status: string,
): {
  label: string;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'error.light'
    | 'info'
    | 'success'
    | 'warning'
    | 'warning.light'
    | 'action.active'
    | 'primary.mainLight'
    | 'warning.dark'
    | 'info.main'
    | 'purple.main';
} => {
  switch (status) {
    case InvoiceStatus.PAID:
      return {label: InvoiceStatusView.PAID, color: 'success'};
    case InvoiceStatus.DRAFT:
      return {label: InvoiceStatusView.DRAFT, color: 'action.active'};
    case InvoiceStatus.EXPIRED:
      return {label: InvoiceStatusView.EXPIRED, color: 'error.light'};
    case InvoiceStatus.NOT_PAID:
      return {label: InvoiceStatusView.NOT_PAID, color: 'primary.mainLight'};
    case InvoiceStatus.PARTIALLY_PAID:
      return {label: InvoiceStatusView.PARTIALLY_PAID, color: 'warning.light'};
    case InvoiceStatus.CANCELLED:
      return {label: InvoiceStatusView.CANCELLED, color: 'warning.dark'};
    case InvoiceStatus.CREDITED:
      return {label: InvoiceStatusView.CREDITED, color: 'info.main'};
    case InvoiceStatus.OVERDUE_NOTICE_1:
      return {label: InvoiceStatusView.OVERDUE_NOTICE_1, color: 'purple.main'};
    case InvoiceStatus.OVERDUE_NOTICE_2:
      return {label: InvoiceStatusView.OVERDUE_NOTICE_2, color: 'purple.main'};
    case InvoiceStatus.OVERDUE_NOTICE_3:
      return {label: InvoiceStatusView.OVERDUE_NOTICE_3, color: 'purple.main'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const isXMLNeeded = (invoice: InvoiceView) => {
  const {invoiceFormat} = invoice.propertyOwner.additionalInfo;
  return (
    invoiceFormat === InvoiceFormat.PDF_AND_XML ||
    invoiceFormat === InvoiceFormat.XML
  );
};

export const buildInvoicePayload = (
  items: EditableInvoiceItem[],
  currentCurrency: Currency,
  discount?: Discount,
  payment?: Payment<Money>,
  taxRates?: VatView[],
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
      payment: item.payment ?? undefined,
    };
  }),
  globalDiscount:
    discount?.type === DiscountType.AMOUNT
      ? {
          type: DiscountType.AMOUNT,
          amount: {
            value: moneyToCents(
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
  paymentRecord:
    payment?.type === PaymentType.LUMP_SUM
      ? {
          ...payment,
          amount: payment?.amount
            ? {
                ...payment.amount,
                value: moneyToCents(currentCurrency.code, payment.amount.value),
                currency: payment.amount.currency || currentCurrency.code,
              }
            : {
                value: 0,
                currency: currentCurrency.code,
                fractionDigits: currentCurrency.fractionDigits,
              },
        }
      : payment,
});

export const invoiceItemToInvoiceItemRecord = (
  invoiceItem: InvoiceItemView,
  invoiceType: InvoiceType,
  currentCurrency: Currency,
  taxRates?: VatView[],
  subItemsMap: Record<string, InvoiceSubItemRecord[]> = {},
): InvoiceItemRecord => {
  const {percentageVat, vatName} = resolveVatFromBackend(
    invoiceItem.unitAmount?.vatId,
    invoiceItem.unitAmount?.percentageVat,
    invoiceItem.unitAmount?.vatName,
    taxRates,
  );

  const {percentageVat: purchaseVat, vatName: purchaseVatName} =
    resolveVatFromBackend(
      invoiceItem.unitPurchaseAmount?.vatId,
      invoiceItem.unitPurchaseAmount?.percentageVat,
      invoiceItem.unitPurchaseAmount?.vatName,
      taxRates,
    );

  const {percentageVat: articleSellingVat, vatName: articleSellingVatName} =
    resolveVatFromBackend(
      invoiceItem.article?.unitSellingAmount?.vatId,
      invoiceItem.article?.unitSellingAmount?.percentageVat,
      invoiceItem.article?.unitSellingAmount?.vatName,
      taxRates,
    );

  const {percentageVat: articlePurchaseVat, vatName: articlePurchaseVatName} =
    resolveVatFromBackend(
      invoiceItem.article?.unitPurchaseAmount?.vatId,
      invoiceItem.article?.unitPurchaseAmount?.percentageVat,
      invoiceItem.article?.unitPurchaseAmount?.vatName,
      taxRates,
    );

  const isCreditNote = invoiceType === InvoiceType.CREDIT_NOTE;
  const negate = (v?: number) => (isCreditNote ? -Math.abs(v ?? 0) : v ?? 0);

  const unitAmount = {
    netAmount: negate(invoiceItem.unitAmount.netAmount),
    percentageVat,
    currency: invoiceItem.unitAmount.currency || currentCurrency.code,
    vatId: invoiceItem.unitAmount.vatId,
    vatName,
  };

  const unitPurchaseAmount = invoiceItem.unitPurchaseAmount
    ? {
        ...invoiceItem.unitPurchaseAmount,
        netAmount: negate(invoiceItem.unitPurchaseAmount.netAmount),
        percentageVat: purchaseVat,
        vatName: purchaseVatName,
      }
    : undefined;

  const discount = invoiceItem.additionalInfo?.discount
    ? {
        ...invoiceItem.additionalInfo.discount,
        type:
          !invoiceItem.additionalInfo.discount.type ||
          invoiceItem.additionalInfo.discount.type === DiscountType.NONE
            ? DiscountType.PERCENTAGE
            : invoiceItem.additionalInfo.discount.type,
        amount: invoiceItem.additionalInfo.discount.amount
          ? {
              ...invoiceItem.additionalInfo.discount.amount,
              value: negate(
                (invoiceItem.additionalInfo.discount.amount.value ?? 0) /
                  10 **
                    (invoiceItem.additionalInfo.discount.amount
                      .fractionDigits ?? 2),
              ),
            }
          : undefined,
      }
    : undefined;

  const record: EditableInvoiceItem = {
    id: invoiceItem.id,
    article: {
      ...invoiceItem.article,
      unitSellingAmount: {
        ...invoiceItem.article?.unitSellingAmount,
        currency:
          invoiceItem.article?.unitSellingAmount?.currency ||
          currentCurrency.code,
        percentageVat: articleSellingVat,
        vatName: articleSellingVatName,
      },
      unitPurchaseAmount: {
        ...invoiceItem.article?.unitPurchaseAmount,
        currency:
          invoiceItem.article?.unitPurchaseAmount?.currency ||
          currentCurrency.code,
        percentageVat: articlePurchaseVat,
        vatName: articlePurchaseVatName,
      },
    },
    name: invoiceItem.name,
    description: invoiceItem.description,
    quantity: invoiceItem.quantity,
    unitAmount,
    unitPurchaseAmount,
    discount,
    userSeqNumber: invoiceItem?.additionalInfo?.userSeqNumber,
    payment: invoiceItem.additionalInfo?.payment,
  };

  // If the article's type is PACKAGE, add a default costPackage if it doesn't exist.
  if (invoiceItem.article?.type === ArticleType.PACKAGE) {
    if (!invoiceItem.article.costPackage) {
      record.article = {
        ...record.article,
        costPackage: {
          laborPercentage: 50,
          materialPercentage: 50,
        },
      };
    }
  }

  if (invoiceItem.article?.type === ArticleType.MIX) {
    const subItems = subItemsMap[invoiceItem.id] || [];

    return {
      ...record,
      subItems: subItems.map((subItem) => {
        const {percentageVat: subVat, vatName: subVatName} =
          resolveVatFromBackend(
            subItem.unitAmount?.vatId,
            subItem.unitAmount?.percentageVat,
            subItem.unitAmount?.vatName,
            taxRates,
          );

        const {percentageVat: subPurchaseVat, vatName: subPurchaseVatName} =
          resolveVatFromBackend(
            subItem.unitPurchaseAmount?.vatId,
            subItem.unitPurchaseAmount?.percentageVat,
            subItem.unitPurchaseAmount?.vatName,
            taxRates,
          );

        const {
          percentageVat: subArticleSellingVat,
          vatName: subArticleSellingVatName,
        } = resolveVatFromBackend(
          subItem.article?.unitSellingAmount?.vatId,
          subItem.article?.unitSellingAmount?.percentageVat,
          subItem.article?.unitSellingAmount?.vatName,
          taxRates,
        );

        const {
          percentageVat: subArticlePurchaseVat,
          vatName: subArticlePurchaseVatName,
        } = resolveVatFromBackend(
          subItem.article?.unitPurchaseAmount?.vatId,
          subItem.article?.unitPurchaseAmount?.percentageVat,
          subItem.article?.unitPurchaseAmount?.vatName,
          taxRates,
        );

        return {
          parentId: invoiceItem.id,
          id: subItem?.id || '',
          article: {
            ...subItem.article,
            unitSellingAmount: {
              ...subItem.article?.unitSellingAmount,
              currency:
                subItem.article?.unitSellingAmount?.currency ||
                currentCurrency.code,
              percentageVat: subArticleSellingVat,
              vatName: subArticleSellingVatName,
            },
            unitPurchaseAmount: {
              ...subItem.article?.unitPurchaseAmount,
              currency:
                subItem.article?.unitPurchaseAmount?.currency ||
                currentCurrency.code,
              percentageVat: subArticlePurchaseVat,
              vatName: subArticlePurchaseVatName,
            },
          },
          name: subItem.name,
          description: subItem.description,
          quantity: subItem.quantity,
          unitAmount: {
            ...subItem.unitAmount,
            netAmount: negate(subItem.unitAmount?.netAmount),
            currency: subItem.unitAmount?.currency || currentCurrency.code,
            percentageVat: subVat,
            vatName: subVatName,
          },
          unitPurchaseAmount: subItem.unitPurchaseAmount
            ? {
                ...subItem.unitPurchaseAmount,
                netAmount: negate(subItem.unitPurchaseAmount?.netAmount),
                currency:
                  subItem.unitPurchaseAmount?.currency || currentCurrency.code,
                percentageVat: subPurchaseVat,
                vatName: subPurchaseVatName,
              }
            : undefined,
          userSeqNumber: subItem.userSeqNumber,
        };
      }),
      subItemsConfig: {
        subItemsVisible:
          invoiceItem.additionalInfo?.subItemsConfig?.subItemsVisible || false,
        priceVisible:
          invoiceItem.additionalInfo?.subItemsConfig?.priceVisible || false,
      },
    };
  }

  return record;
};

export const articleViewToItem = (
  articleView: ServiceOrderArticleView,
  currentCurrency: Currency,
  taxRates?: VatView[],
  subItemsMap: Record<string, InvoiceSubItemRecord[]> = {},
): InvoiceItemRecord => {
  const {percentageVat, vatName} = resolveVatFromBackend(
    articleView.unitAmount?.vatId,
    articleView.unitAmount?.percentageVat,
    articleView.unitAmount?.vatName,
    taxRates,
  );

  const {percentageVat: purchaseVat, vatName: purchaseVatName} =
    resolveVatFromBackend(
      articleView.unitPurchaseAmount?.vatId,
      articleView.unitPurchaseAmount?.percentageVat,
      articleView.unitPurchaseAmount?.vatName,
      taxRates,
    );

  const {percentageVat: articleSellingVat, vatName: articleSellingVatName} =
    resolveVatFromBackend(
      articleView.article?.unitSellingAmount?.vatId,
      articleView.article?.unitSellingAmount?.percentageVat,
      articleView.article?.unitSellingAmount?.vatName,
      taxRates,
    );

  const {percentageVat: articlePurchaseVat, vatName: articlePurchaseVatName} =
    resolveVatFromBackend(
      articleView.article?.unitPurchaseAmount?.vatId,
      articleView.article?.unitPurchaseAmount?.percentageVat,
      articleView.article?.unitPurchaseAmount?.vatName,
      taxRates,
    );

  const record: InvoiceItemRecord = {
    id: articleView.id,
    article: {
      ...articleView.article,
      unitSellingAmount: {
        ...articleView.article?.unitSellingAmount,
        currency:
          articleView.article?.unitSellingAmount?.currency ||
          currentCurrency.code,
        percentageVat: articleSellingVat,
        vatName: articleSellingVatName,
      },
      unitPurchaseAmount: {
        ...articleView.article?.unitPurchaseAmount,
        currency:
          articleView.article?.unitPurchaseAmount?.currency ||
          currentCurrency.code,
        percentageVat: articlePurchaseVat,
        vatName: articlePurchaseVatName,
      },
    },
    name: articleView.name,
    description: articleView.description,
    quantity: articleView.quantity,
    unitAmount: {
      netAmount: articleView.unitAmount.netAmount || 0,
      percentageVat,
      currency: articleView.unitAmount.currency || currentCurrency.code,
      vatId: articleView.unitAmount.vatId || '',
      vatName,
    },
    unitPurchaseAmount: {
      ...articleView.unitPurchaseAmount,
      currency:
        articleView.unitPurchaseAmount?.currency || currentCurrency.code,
      percentageVat: purchaseVat,
      vatName: purchaseVatName,
    },
    discount: getDiscoutObj(articleView.additionalInfo?.discount),
    userSeqNumber: articleView?.additionalInfo?.userSeqNumber,
  };

  // If the article's type is PACKAGE, add a default costPackage if it doesn't exist.
  if (articleView.article?.type === ArticleType.PACKAGE) {
    if (!articleView.article.costPackage) {
      record.article = {
        ...record.article,
        costPackage: {
          laborPercentage: 50,
          materialPercentage: 50,
        },
      };
    }
  }

  if (articleView.article?.type === ArticleType.MIX) {
    const subItems = subItemsMap[articleView.id] || [];

    return {
      ...record,
      subItems: subItems.map((subItem) => {
        const {percentageVat: subVat, vatName: subVatName} =
          resolveVatFromBackend(
            subItem.unitAmount?.vatId,
            subItem.unitAmount?.percentageVat,
            subItem.unitAmount?.vatName,
            taxRates,
          );

        const {percentageVat: subPurchaseVat, vatName: subPurchaseVatName} =
          resolveVatFromBackend(
            subItem.unitPurchaseAmount?.vatId,
            subItem.unitPurchaseAmount?.percentageVat,
            subItem.unitPurchaseAmount?.vatName,
            taxRates,
          );

        const {
          percentageVat: subArticleSellingVat,
          vatName: subArticleSellingVatName,
        } = resolveVatFromBackend(
          subItem.article?.unitSellingAmount?.vatId,
          subItem.article?.unitSellingAmount?.percentageVat,
          subItem.article?.unitSellingAmount?.vatName,
          taxRates,
        );

        const {
          percentageVat: subArticlePurchaseVat,
          vatName: subArticlePurchaseVatName,
        } = resolveVatFromBackend(
          subItem.article?.unitPurchaseAmount?.vatId,
          subItem.article?.unitPurchaseAmount?.percentageVat,
          subItem.article?.unitPurchaseAmount?.vatName,
          taxRates,
        );

        return {
          parentId: articleView.id,
          id: subItem?.id || '',
          article: {
            ...subItem.article,
            unitSellingAmount: {
              ...subItem.article?.unitSellingAmount,
              currency:
                subItem.article?.unitSellingAmount?.currency ||
                currentCurrency.code,
              percentageVat: subArticleSellingVat,
              vatName: subArticleSellingVatName,
            },
            unitPurchaseAmount: {
              ...subItem.article?.unitPurchaseAmount,
              currency:
                subItem.article?.unitPurchaseAmount?.currency ||
                currentCurrency.code,
              percentageVat: subArticlePurchaseVat,
              vatName: subArticlePurchaseVatName,
            },
          },
          name: subItem.name,
          description: subItem.description,
          quantity: subItem.quantity,
          unitAmount: {
            ...subItem.unitAmount,
            currency: subItem.unitAmount?.currency || currentCurrency.code,
            percentageVat: subVat,
            vatName: subVatName,
          },
          unitPurchaseAmount: subItem.unitPurchaseAmount
            ? {
                ...subItem.unitPurchaseAmount,
                currency:
                  subItem.unitPurchaseAmount?.currency || currentCurrency.code,
                percentageVat: subPurchaseVat,
                vatName: subPurchaseVatName,
              }
            : undefined,
          userSeqNumber: subItem.userSeqNumber,
        };
      }),
      subItemsConfig: {
        subItemsVisible:
          articleView.additionalInfo?.subArticlesConfig?.subItemsVisible ||
          false,
        priceVisible:
          articleView.additionalInfo?.subArticlesConfig?.priceVisible || false,
      },
    };
  }

  return record;
};

export function hasAlternativeAddress(address?: AddressRecord) {
  if (!address || Object.keys(address).length === 0) return false;

  const name = address.component?.name?.trim() || '';
  const fullName = address.fullName?.trim() || '';
  return Boolean(name || fullName);
}

export const calculateLaborMaterialTotals = (
  uiItems: EditableInvoiceItem[] = [],
  detailItems: InvoiceItemAmount[] = [],
) => {
  const getNet = (item: InvoiceItemAmount | InvoiceSubItemAmount | undefined) =>
    item?.payment?.amount?.netAmount ?? 0;

  return uiItems.reduce(
    (totals, uiItem, idx) => {
      const detailItem = detailItems[idx];
      if (!detailItem) return totals;

      const {article, subItems: uiSubs} = uiItem;
      const articleType = article?.type;

      if (
        articleType === ArticleType.MIX &&
        Array.isArray(uiSubs) &&
        uiSubs.length
      ) {
        uiSubs.forEach((uiSub, subIdx) => {
          const subDetail: InvoiceSubItemAmount | undefined =
            detailItem.subItems?.[subIdx];
          const subNet = getNet(subDetail);

          switch (uiSub.article?.type) {
            case ArticleType.LABOR:
              totals.laborNet += subNet;
              break;
            case ArticleType.MATERIAL:
              totals.materialNet += subNet;
              break;
            case ArticleType.PACKAGE:
              {
                const pkg = uiSub.article.costPackage;
                if (pkg) {
                  totals.laborNet +=
                    subNet * ((pkg.laborPercentage ?? 0) / 100);
                  totals.materialNet +=
                    subNet * ((pkg.materialPercentage ?? 0) / 100);
                } else {
                  totals.materialNet += subNet;
                }
              }
              break;
            default:
              break;
          }
        });
      } else {
        const mainNet = getNet(detailItem);

        switch (articleType) {
          case ArticleType.LABOR:
            totals.laborNet += mainNet;
            break;
          case ArticleType.MATERIAL:
            totals.materialNet += mainNet;
            break;
          case ArticleType.PACKAGE:
            {
              const pkg = article?.costPackage;
              if (pkg) {
                totals.laborNet += mainNet * ((pkg.laborPercentage ?? 0) / 100);
                totals.materialNet +=
                  mainNet * ((pkg.materialPercentage ?? 0) / 100);
              } else {
                totals.materialNet += mainNet;
              }
            }
            break;
          default:
            break;
        }
      }

      return totals;
    },
    {laborNet: 0, materialNet: 0},
  );
};

export const makeFormPayment = (rawPayment?: {
  type: string;
  description?: string;
  percentage?: number;
  amount?: AggregatedAmount;
}):
  | {
      type: PaymentType;
      description: string;
      percentage?: number;
      amount?: {
        value: number;
        currency: string;
        fractionDigits: number;
      };
    }
  | undefined => {
  if (!rawPayment) return undefined;

  const type = rawPayment.type as PaymentType;
  const description = rawPayment.description || '';

  switch (type) {
    case PaymentType.LUMP_SUM: {
      if (!rawPayment.amount) {
        // If there's no amount object, just default to zero
        return {
          type,
          description,
          amount: {value: 0, currency: 'EUR', fractionDigits: 2},
        };
      }
      // Convert the AggregatedAmount (in cents) → Money
      const amountMoney = aggregatedAmountToMoney(rawPayment.amount);
      amountMoney.value =
        (amountMoney.value ?? 0) / 10 ** (amountMoney.fractionDigits ?? 2);

      return {
        type,
        description,
        amount: {
          value: amountMoney.value!,
          currency: amountMoney.currency,
          fractionDigits: amountMoney.fractionDigits!,
        },
      };
    }

    case PaymentType.PERCENTAGE: {
      return {
        type,
        description,
        percentage: rawPayment.percentage ?? 0,
      };
    }

    case PaymentType.PER_ITEM: {
      return {
        type,
        description,
        // For per‐item, we only carry over the percentage
        percentage: rawPayment.percentage ?? 0,
      };
    }

    default:
      return undefined;
  }
};

export const collectVatsFromInvoices = (
  invoices?: InvoiceView[],
): VatAmount[] => invoices?.flatMap((inv) => inv.totalAmount?.vats || []) ?? [];

export const aggregateVats = (vats: VatAmount[] = []): VatAmount[] => {
  const grouped = vats.reduce<Record<number, VatAmount>>(
    (acc, {percentageVat, vat}) => {
      if (!acc[percentageVat]) {
        acc[percentageVat] = {percentageVat, vat: 0};
      }
      acc[percentageVat].vat += vat;
      return acc;
    },
    {},
  );

  return Object.values(grouped);
};

export const getFormattedPaymentTerms = (
  paymentTerm: ContractPaymentTermView | ContractTermView,
  companyLanguage: string = 'en',
) => {
  const discountOptions = paymentTerm.data?.discountOptions
    ?.map((d) => {
      const discountDays = d.discountDays || 0;
      const discountPercentage = d.discountPercent || 0;

      if (discountDays > 0 && discountPercentage > 0) {
        return t(
          `If you pay before {DUE_DATE} we grant {{discountPercentage}}% discount ({DISCOUNT_AMOUNT}) based on {INVOICE_AMOUNT}. Payment amount: {PAYMENT_AMOUNT}`,
          {discountPercentage, lng: companyLanguage},
        );
      }

      return '';
    })
    .filter((option) => option !== '') // Filter out empty strings
    .join('\n');

  return {
    data: paymentTerm?.data,
    id: paymentTerm.id,
    term: discountOptions
      ? `${paymentTerm.term}\n${discountOptions}`
      : paymentTerm.term,
  };
};

export const getInvoiceFrequencyTimeUnit = ({
  selectedFrequency,
  isYearlyFrequency,
  isAfterJobCompletion,
}: GetInvoiceTimeUnit) => {
  // on Job completion case
  if (isAfterJobCompletion) {
    return ContractTimeUnit.NONE;
  }

  // yearly frequency cases
  if (isYearlyFrequency) {
    switch (selectedFrequency) {
      case 'everyYear':
        return ContractTimeUnit.ANNUALLY;
      case 'every2Years':
        return ContractTimeUnit.BIENNIALLY;
      case 'every3Years':
        return ContractTimeUnit.TRIENNIALLY;
      case 'every4Years':
        return ContractTimeUnit.QUADRENNIALLY;
      case 'every5Years':
        return ContractTimeUnit.EVERY_5_YEARS;
      default:
        return ContractTimeUnit.MONTHLY;
    }
  }

  // Default case for non-yearly frequencies
  return ContractTimeUnit.MONTHLY;
};

export const getInvoiceFrequencyValuesFromTimeUnit = (
  timeUnit?: ContractTimeUnit,
): InvoiceFrequencyValues => {
  switch (timeUnit) {
    case ContractTimeUnit.NONE:
      return {
        selectedCaseFrequency: '',
        yearlyFrequency: false,
        afterJobCompletion: true,
      };
    case ContractTimeUnit.ANNUALLY:
      return {
        selectedCaseFrequency: 'everyYear',
        yearlyFrequency: true,
        afterJobCompletion: false,
      };
    case ContractTimeUnit.BIENNIALLY:
      return {
        selectedCaseFrequency: 'every2Years',
        yearlyFrequency: true,
        afterJobCompletion: false,
      };
    case ContractTimeUnit.TRIENNIALLY:
      return {
        selectedCaseFrequency: 'every3Years',
        yearlyFrequency: true,
        afterJobCompletion: false,
      };
    case ContractTimeUnit.QUADRENNIALLY:
      return {
        selectedCaseFrequency: 'every4Years',
        yearlyFrequency: true,
        afterJobCompletion: false,
      };
    case ContractTimeUnit.EVERY_5_YEARS:
      return {
        selectedCaseFrequency: 'every5Years',
        yearlyFrequency: true,
        afterJobCompletion: false,
      };
    default:
      return {
        selectedCaseFrequency: '',
        yearlyFrequency: false,
        afterJobCompletion: false,
      };
  }
};
