import * as Yup from 'yup';
import {TestContextExtended} from 'models/articleForm';
import {
  ArticleSubAssociationView,
  ArticleTableRow,
  ArticleType,
  ArticleView,
  ExtendedArticleView,
  MixedPositionRow,
  SearchParameters,
  SubPositionRow,
  UpdateArticleRecord,
} from 'models/article';
import {QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord} from 'models/invoice';
import {VatView} from 'models/vat';
import {MultiVatsAmount} from 'models/misc';
import {Currencies, formatCurrency} from './currency';
import {cleanHtmlContent, replaceTextInHtml, stripHtmlTags} from './text-block';
import {convertToText} from './utils';
import {CreateArticleRecord} from '../models/article';

export const handleCostPackageValidation = (
  value: number | undefined,
  context: Yup.AnyObject,
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
  const {netAmount} = record.unitAmount!;
  const vat =
    (percentageVat * (netAmount ?? 0)) /
    10 ** Currencies[record.unitAmount!.currency];
  return {
    ...record,
    unitAmount: {
      ...record.unitAmount,
      currency: record.unitAmount!.currency,
      netAmount,
      percentageVat,
      vat,
      grossAmount: (netAmount ?? 0) + vat,
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
        10 ** (article.unitSellingAmount.fractionDigits || 0),
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

export const syncVatLegalNotesWithNotes = ({
  oldArticles,
  newArticles,
  currentNotes,
  taxRates,
}: {
  oldArticles: QuotationItemRecord[];
  newArticles: QuotationItemRecord[];
  currentNotes: string;
  taxRates?: VatView[];
}) => {
  let notes = currentNotes || '';

  if (!taxRates) {
    return notes;
  }

  const getLegalNoteForVatId = (vatId?: string) => {
    if (!vatId) return '';
    return taxRates.find((rate) => rate.id === vatId)?.legalNote || '';
  };

  // Add new legal notes
  newArticles.forEach((item) => {
    const {vatId} = item.unitAmount!;
    const legalNote = getLegalNoteForVatId(vatId);
    if (!legalNote) {
      return;
    }
    if (stripHtmlTags(notes).includes(legalNote)) {
      return;
    }
    const newValue = cleanHtmlContent(`<p>${legalNote}</p>`);
    notes += ` ${newValue}`;
  });

  // Remove obsolete legal notes
  oldArticles.forEach((item) => {
    const {vatId} = item.unitAmount!;
    const legalNote = getLegalNoteForVatId(vatId);
    if (!legalNote) {
      return;
    }
    if (newArticles.every((newItem) => newItem.unitAmount!.vatId !== vatId)) {
      notes = replaceTextInHtml(notes, `<p>${legalNote}</p>`, '');
    }
  });

  return notes;
};

export const calculatePackageMaterialLaborPercentages = (costPackage?: {
  laborPercentage?: number;
  materialPercentage?: number;
}) => {
  const labor = costPackage?.laborPercentage ?? 0;
  const material = costPackage?.materialPercentage ?? 0;

  let laborPercentage = labor;
  let materialPercentage = material;

  // If both are 0, set default 50-50 split
  if (labor === 0 && material === 0) {
    laborPercentage = 50;
    materialPercentage = 50;
  }
  // If one is 0, set the other to remaining percentage
  else if (labor === 0) {
    materialPercentage = Math.min(material, 100);
    laborPercentage = 100 - materialPercentage;
  } else if (material === 0) {
    laborPercentage = Math.min(labor, 100);
    materialPercentage = 100 - laborPercentage;
  }
  // If sum > 100, scale down proportionally
  else if (labor + material > 100) {
    const total = labor + material;
    laborPercentage = Math.round((labor / total) * 100);
    materialPercentage = 100 - laborPercentage;
  }

  return {laborPercentage, materialPercentage};
};

export const getSubPositionById = (
  subPositionId: string,
  subRows: Record<string, SubPositionRow[]>,
) => {
  const subPosition = Object.values(subRows)
    .flat()
    .find((sub) => sub?.id === subPositionId);

  return subPosition || null;
};

export const calculateMargin = (
  sellingAmount: number,
  purchaseAmount: number,
) => {
  const margin =
    purchaseAmount === 0 || sellingAmount === 0
      ? 0
      : ((sellingAmount - purchaseAmount) / purchaseAmount) * 100;

  return Number.isFinite(margin) ? margin : 0;
};

export const aggregateMixedPositionRow = (
  articles: ArticleView[],
): MixedPositionRow[] =>
  articles.map((article) => ({
    data: article,
    id: article.id,
    externalId: article.externalId,
    name: article.name,
    description: article.description,
    type: article.type,
    unit: article.unit,
    unitPurchaseAmount: article.unitPurchaseAmount,
    unitAmount: article.unitSellingAmount,
    quantity: 1,
  }));

export const transformToSubPositionRow = (
  subAssociation: ArticleSubAssociationView,
): SubPositionRow => ({
  id: subAssociation.id,
  article: subAssociation.article,
  quantity: subAssociation.quantity,
  seqNumber: subAssociation.seqNumber,
  externalId: subAssociation.article.externalId,
  name: subAssociation.article.name,
  description: subAssociation.article.description,
  type: subAssociation.article.type,
  unit: subAssociation.article.unit,
  unitPurchaseAmount: subAssociation.article.unitPurchaseAmount,
  unitAmount: subAssociation.article.unitSellingAmount,
  createdAt: subAssociation.createdAt,
  lastUpdatedAt: subAssociation.lastUpdatedAt,
});

export const getBackButtonTitle = (value: number): string => {
  switch (value) {
    case 0:
      return 'New Article';
    case 1:
      return 'New Mixed Position';
    default:
      return 'New Supplier';
  }
};

export const getFilteredArticleTypeOptions = ({
  excludeTypes = [],
}: {
  excludeTypes?: ArticleType[];
}) =>
  Object.values(ArticleType)
    .filter((type) => !excludeTypes.includes(type))
    .map((value) => ({
      value,
      label: convertToText(value),
    }));

export const getArticleTypes = ({
  excludeTypes = [],
}: {
  excludeTypes?: ArticleType[];
}): ArticleType[] => {
  const excludedSet = new Set(excludeTypes);
  return Object.values(ArticleType).filter((type) => !excludedSet.has(type));
};

export const mapUpdatedBodyToArticleView = (
  updatedBody: ExtendedArticleView,
  defaultValues?: Partial<ArticleView>,
): ArticleView => ({
  id: defaultValues?.id || '',
  externalId: updatedBody.externalId || '',
  serviceCompanyId: (updatedBody as CreateArticleRecord).serviceCompanyId || '',
  name: updatedBody.name || '',
  description: updatedBody.description || '',
  model: updatedBody.model || '',
  type: updatedBody.type || ArticleType.OTHER,
  category: updatedBody.category || '',
  subCategory: updatedBody.subCategory || '',
  manufacturer: updatedBody.manufacturer || '',
  unit: updatedBody.unit || '',
  unitPurchaseAmount: updatedBody.unitPurchaseAmount as MultiVatsAmount,
  unitSellingAmount:
    (updatedBody as ExtendedArticleView)?.customSellingAmount ||
    (updatedBody.unitSellingAmount as MultiVatsAmount),
  storageLocation: updatedBody.storageLocation || '',
  stock: updatedBody.stock || {
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    minOrderQuantity: 0,
  },
  costPackage: updatedBody.costPackage || undefined,
  additionalInfo: {
    contractName:
      (updatedBody as UpdateArticleRecord | CreateArticleRecord)
        ?.contractName || '',
    costPackage: updatedBody.costPackage || undefined,
    items: [],
    pictureUrls: [],
  },
  meta: defaultValues?.meta!,
  number: defaultValues?.number || '',
  search: `${updatedBody.name || ''} ${updatedBody.description || ''}`.trim(),
  canDelete: defaultValues?.canDelete || false,
  suppliers: defaultValues?.suppliers || [],
  propertyOwnerId: defaultValues?.propertyOwnerId || '',
});

export const getArticleTypesWithLabels = ({
  excludeTypes = [],
}: {
  excludeTypes?: ArticleType[];
}): {value: ArticleType; label: string}[] => {
  const excludedSet = new Set(excludeTypes);

  const typeLabels: Record<ArticleType, string> = {
    [ArticleType.LABOR]: 'Labor',
    [ArticleType.MATERIAL]: 'Material',
    [ArticleType.PACKAGE]: 'Package',
    [ArticleType.MIX]: 'Mixed Position',
    [ArticleType.OTHER]: 'Other',
  };

  return Object.values(ArticleType)
    .filter((type) => !excludedSet.has(type))
    .map((type) => ({
      value: type,
      label: typeLabels[type] ?? type,
    }));
};
