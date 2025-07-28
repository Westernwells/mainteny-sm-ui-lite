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
import {EditableQuotationItem, QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord} from 'models/invoice';
import {VatView} from 'models/vat';
import {MultiVatsAmount} from 'models/misc';
import {stripHtmlTags} from '../pages/InvoiceDetails/utils';
import {Currencies, formatCurrency} from './currency';
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
    tags: article.additionalInfo?.tags ?? [],
  }));

export const createSearchQuery = ({
  search,
  storageLocation,
  category,
  manufacturer,
}: SearchParameters) => {
  const elements: string[] = [];
  const [firstSearch, ...tags] = (search || '').split('#');
  if (tags.length > 0) tags.forEach((tag) => elements.push(`[tag:*${tag}*]`));
  if (firstSearch) elements.push(firstSearch);
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
  oldArticles: EditableQuotationItem[];
  newArticles: EditableQuotationItem[];
  currentNotes: string;
  taxRates?: VatView[];
}) => {
  let notes = currentNotes;

  newArticles.forEach((newArt) => {
    const oldArt = oldArticles.find((o) => o.id === newArt.id);
    const oldVatId = oldArt?.unitAmount?.vatId;
    const newVatId = newArt.unitAmount?.vatId;

    // If the VAT‐ID changed (or was undefined → defined), append the new legal note:
    if (oldVatId !== newVatId) {
      const vatInfo = taxRates?.find((v) => v.id === newVatId);
      if (vatInfo?.legalNote && !notes.includes(vatInfo.legalNote)) {
        // If there's already some non‐blank text, insert a newline + <p>…</p>.
        if (stripHtmlTags(notes).trim().length > 0) {
          notes += `\n<p>${vatInfo.legalNote}</p>`;
        } else {
          // Otherwise, start with a bare <p>…</p>
          notes = `<p>${vatInfo.legalNote}</p>`;
        }
      }
    }
  });

  return notes;
};

export const removeObsoleteVatNotes = (
  currentNotes: string,
  oldArticles: EditableQuotationItem[],
  newArticles: EditableQuotationItem[],
  prevTaxRates?: VatView[],
): string => {
  let updated = currentNotes;
  if (!prevTaxRates) return updated;

  // build a Set of vatIds still in use
  const newVatIds = new Set<string>();
  newArticles.forEach((art) => {
    const id = art.unitAmount?.vatId;
    if (id) newVatIds.add(id);
  });

  oldArticles.forEach((oldArt) => {
    const oldVatId = oldArt.unitAmount?.vatId;
    if (!oldVatId || newVatIds.has(oldVatId)) {
      return;
    }
    const note = prevTaxRates.find((v) => v.id === oldVatId)?.legalNote?.trim();
    if (!note) return;

    // escape regex chars, then remove "<p>…</p>" or bare note
    const escaped = note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`(?:<p>\\s*${escaped}\\s*</p>|${escaped})`, 'g');
    updated = updated.replace(rx, '');
  });

  // strip any leftover empty <p>…</p> tags, collapse blank lines, trim
  updated = updated.replace(/<p[^>]*>\s*<\/p>/g, '');
  updated = updated.replace(/\n\s*\n+/g, '\n\n').trim();
  return updated;
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
