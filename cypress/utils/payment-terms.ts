import {addDays} from 'date-fns';
import {ArticleType} from 'models/article';
import {PaymentTermData, PaymentTermArticleType} from 'models/contract';
import {
  InvoicePaymentTermRecord,
  InvoiceAmountDetail,
  InvoiceItem,
} from 'models/invoice';
import {centsToMoney, formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {Currency} from 'models/misc';
import {InvoiceView} from './utils';

export const getFormattedPaymentValues = (
  paymentTerm: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  },
  invoice: InvoiceView,
  invoiceAmountDetail: InvoiceAmountDetail,
  currentCurrency?: Currency,
) => {
  const discountValues = paymentTerm?.data?.discountOptions?.map((d) => {
    const dueDate = addDays(
      invoice.sentDate ? new Date(invoice.sentDate) : new Date(),
      d.discountDays || 0,
    );
    const formattedDueDate = formatDate(dueDate);

    let filteredItems: InvoiceItem[] = [];
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

        if (item?.article?.type === ArticleType.PACKAGE) {
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

  // Split the template into sections to handle replacements independently
  const sections = template.split('\n');

  let result = '';

  replacements.forEach((replacement, index) => {
    if (
      replacement.discountAmount &&
      replacement.discountAmount > 0 &&
      replacement.invoiceAmount &&
      replacement.invoiceAmount > 0
    ) {
      // Target the appropriate section for replacement based on index
      let sectionToReplace = sections[index + 1];

      if (sectionToReplace) {
        sectionToReplace = sectionToReplace.replace(
          '{DUE_DATE}',
          replacement.formattedDueDate || '',
        );
        sectionToReplace = sectionToReplace.replace(
          '{DISCOUNT_AMOUNT}',
          formatCurrency(replacement.discountAmount, {
            currency: currentCurrency?.code,
            currencySymbol: currentCurrency?.symbol,
            companyLang: selectedLng,
          }) || '',
        );
        sectionToReplace = sectionToReplace.replace(
          '{INVOICE_AMOUNT}',
          formatCurrency(replacement.invoiceAmount, {
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

        result += `${sections[0]}\n${sectionToReplace}\n`;
      }
    }
  });

  return result.trim();
};

export const normalizeExtractedText = (text: string): string =>
  text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/€\s/g, '€') // Ensure no space after the Euro symbol
    .trim();

export const extractKeyValuesFromFormattedTerms = (formattedTerms: string) => {
  const dateRegex = /\d{2}\.\d{2}\.\d{4}/g; // To match dates (DD.MM.YYYY)
  const percentageRegex = /\d{1,2}%/g; // To match percentages
  const amountRegex = /€[\d,.]+/g; // To match amounts with euro symbol

  const dates = formattedTerms.match(dateRegex) || [];
  const percentages = formattedTerms.match(percentageRegex) || [];
  const amounts = formattedTerms.match(amountRegex) || [];

  return [...dates, ...percentages, ...amounts];
};
