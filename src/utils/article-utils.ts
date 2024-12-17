import * as Yup from 'yup';
import {AnyObject} from 'yup/lib/types';
import {TestContextExtended} from 'models/articleForm';
import {
  ArticleTableRow,
  ArticleType,
  ArticleView,
  SearchParameters,
} from 'models/article';
import {QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord} from 'models/invoice';
import {Currencies, formatCurrency} from './currency';

export const handleCostPackageValidation = (
  value: number | undefined,
  context: AnyObject,
) => {
  const {from} = context as Yup.TestContext & TestContextExtended;
  const main = from[2];
  if (!value && main.value.type === ArticleType.PACKAGE) {
    return false;
  }
  if (
    value &&
    main.value.unitSellingAmount &&
    main.value.type === ArticleType.PACKAGE
  ) {
    return (
      (main.value.costPackage?.labor?.value ?? 0) +
        (main.value.costPackage?.material?.value ?? 0) ===
      Number(main.value.unitSellingAmount)
    );
  }
  return true;
};

export const getItemRecord = (
  record: QuotationItemRecord | InvoiceItemRecord,
  percentageVat: number,
) => {
  const {netAmount} = record.unitAmount;
  const vat =
    (percentageVat * netAmount) / 10 ** Currencies[record.unitAmount.currency];
  return {
    ...record,
    unitAmount: {
      ...record.unitAmount,
      netAmount,
      percentageVat,
      vat,
      grossAmount: netAmount + vat,
    },
  };
};

export const getArticleTypeText = (type: ArticleType): string => {
  switch (type) {
    case ArticleType.LABOR:
      return 'Labor';
    case ArticleType.MATERIAL:
      return 'Material';
    case ArticleType.PACKAGE:
      return 'Package';
    case ArticleType.OTHER:
      return 'Other';
    default:
      return '';
  }
};

export const aggregateArticleRow = (
  articles: ArticleView[],
): ArticleTableRow[] =>
  articles.map((article) => ({
    data: article,
    id: article.id,
    number: article.externalId,
    name: article.name,
    description: article.description,
    manufacturer: article.manufacturer,
    category: article.category,
    type: article.type,
    unit: article.unit,
    price: formatCurrency(
      (article.unitSellingAmount.netAmount ?? 0) /
        (10 ** article.unitSellingAmount.fractionDigits || 0),
      {
        currency: article.unitSellingAmount.currency,
      },
    ),
  }));

export const createSearchQuery = ({
  search,
  storageLocation,
  category,
  manufacturer,
}: SearchParameters) => {
  const elements: string[] = [];
  if (search) elements.push(search);
  if (storageLocation) elements.push(`[storagelocation:*${storageLocation}*]`);
  if (category) elements.push(`[category:*${category}*]`);
  if (manufacturer) elements.push(`[manufacture:*${manufacturer}*]`);

  return elements.length ? elements.join(' ') : undefined;
};
