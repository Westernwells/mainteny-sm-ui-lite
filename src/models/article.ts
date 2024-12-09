import {convertToText} from '../utils/utils';
import {FileResource, FileResourceRecord} from './media';
import {Amount, AmountRecord, Meta, Money, PdfGenerationStatus} from './misc';
import {ServiceCompany} from './service-company';
import {Order} from './pagination';
import {
  ArticleSupplierSimpleView,
  ArticleSupplierView,
  SupplierRecord,
} from './supplier';
import {
  ServiceOrderArticleOwnerType,
  ServiceOrderArticleView,
} from './service-order';

export enum ArticleType {
  LABOR = 'LABOR',
  MATERIAL = 'MATERIAL',
  PACKAGE = 'PACKAGE',
  OTHER = 'OTHER',
}

// order matters for quick filter displaying
export enum ARTICLE_TYPE_FILTER {
  ALL = 'ALL',
  MATERIAL = 'MATERIAL',
  LABOR = 'LABOR',
  PACKAGE = 'PACKAGE',
  OTHER = 'OTHER',
}

export const articleTypeOptions = Object.values(ArticleType).map((value) => ({
  value,
  label: convertToText(value),
}));

export enum ArticleOrderField {
  NAME = 'NAME',
  CREATED_DATE = 'CREATED_DATE',
  XERO_LAST_SYNC_TIME = 'XERO_LAST_SYNC_TIME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  TYPE = 'TYPE',
  UNIT = 'UNIT',
  DESCRIPTION = 'DESCRIPTION',
  SELLING_NET_AMOUNT = 'SELLING_NET_AMOUNT',
  SELLING_PERCENTAGE_VAT = 'SELLING_PERCENTAGE_VAT',
  CATEGORY = 'CATEGORY',
  MANUFACTURER = 'MANUFACTURER',
}

export interface ArticleItem {
  articleId: string;
  quantity: number;
}

export interface CostPackage {
  laborPercentage?: number;
  materialPercentage?: number;
  labor?: Money;
  material?: Money;
}

export interface ArticleAdditionalInfo {
  items: ArticleItem[];
  pictureUrls: string[];
  qrCode: FileResource;
  costPackage?: CostPackage;
  pictures: FileResource[];
}

export interface ArticleView {
  additionalInfo: ArticleAdditionalInfo;
  canDelete: boolean;
  category: string;
  description: string;
  id: string;
  externalId: string;
  manufacturer: string;
  meta: Meta;
  model: string;
  name: string;
  number: string;
  search: string;
  serviceCompanyId: string;
  propertyOwnerId?: string;
  stock: Stock;
  storageLocation: string;
  subCategory: string;
  type: ArticleType;
  unit: string;
  unitPurchaseAmount?: Amount;
  unitSellingAmount: Amount;
  suppliers: ArticleSupplierItemView[];
  costPackage?: CostPackage;
}

export interface ArticleViewItem {
  article: ArticleView;
  quantity: number;
}

export interface CreateArticleRecord {
  category: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  name: string;
  externalId: string;
  pictureUrls?: (string | undefined)[];
  qrCode?: FileResourceRecord;
  serviceCompanyId: string;
  stock?: Stock;
  storageLocation?: string;
  subCategory?: string;
  suppliers: SupplierRecord[];
  type: string;
  unit: string;
  unitPurchaseAmount: AmountRecord;
  unitSellingAmount: AmountRecord;
  costPackage?: {
    labor?: Money;
    material?: Money;
    laborPercentage?: number;
    materialPercentage?: number;
  };
}

export interface UpdateArticleRecord {
  category?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  name?: string;
  externalId?: string;
  pictureUrls?: (string | undefined)[];
  qrCode?: FileResourceRecord;
  serviceCompanyId?: string;
  stock?: Stock;
  storageLocation?: string;
  subCategory?: string;
  suppliers?: SupplierRecord[];
  type?: string;
  unit?: string;
  unitPurchaseAmount?: AmountRecord;
  unitSellingAmount?: AmountRecord;
  costPackage?: CostPackage;
  pictures?: {description: string; type: string; uri: string}[];
}

export interface QueryArticleParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
  type?: ArticleType[];
  manufacturer?: string;
  supplier?: string;
  order?: Order;
  orderByField?: ArticleOrderField;
  sellingPriceStart?: string;
  sellingPriceEnd?: string;
  purchasePriceStart?: string;
  purchasePriceEnd?: string;
  sellingVatPercent?: number;
  unit?: string[];
}

export interface Stock {
  currentStock: number;
  maxStock: number;
  minOrderQuantity: number;
  minStock: number;
}

export interface ArticleSupplierItemView {
  id: string;
  articleId: string;
  supplier: ArticleSupplierView;
  number: string;
  isPreferred?: boolean;
  additionalInfo: string;
}

export interface ServiceOrderArticleRecord {
  articleId: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: AmountRecord;
  article: ArticleRecord;
}

export interface ArticleOrderItemRecord {
  articleId: string;
  articleName: string;
  supplierArticleNumber: string;
  quantity: number;
  unit: string;
  description: string;
  unitSellingAmount: Amount;
  unitPurchaseAmount?: Amount;
}

export interface CreateArticleOrderRecord {
  serviceCompanyId: string;
  externalId: string;
  articleSupplierId: string;
  description: string;
  items: ArticleOrderItemRecord[];
}

export enum ArticleOrderStatus {
  DRAFT = 'DRAFT',
}

export interface ArticleSimpleView {
  id: string;
  serviceCompanyId: string;
  name: string;
  description: string;
  number: string;
  externalId: string;
  model: string;
  type: ArticleType;
  category: string;
  subCategory: string;
  manufacturer: string;
  meta: Meta;
}

export interface ArticleOrderItemView {
  id: string;
  article: ArticleView;
  articleName: string;
  supplierArticleNumber: string;
  quantity: number;
  unit: string;
  description: string;
  data: string;
}

export interface ArticleOrderAdditionalInfo {
  pdfPath: string;
  pdfGenerationStatus: PdfGenerationStatus;
}

export interface ArticleOrderView {
  id: string;
  number: string;
  externalId: string;
  articleSupplier: ArticleSupplierSimpleView;
  description: string;
  items: ArticleOrderItemView[];
  additionalInfo: ArticleOrderAdditionalInfo;
  status: ArticleOrderStatus;
  search: string;
  meta: Meta;
  serviceCompany: ServiceCompany;
}

export interface PropertyOwnerArticleRecord {
  id?: string;
  name: string;
  externalId?: string;
  type: ArticleType;
  category: string;
  unit: string;
  unitPurchaseAmount: AmountRecord;
  unitSellingAmount: AmountRecord;
}

export interface ArticleRecord {
  id: string;
  name?: string;
  externalId: string;
  type: ArticleType;
  unit: string;
  unitSellingAmount?: AmountRecord;
  costPackage?: CostPackage;
  generationInfo?: {
    contractId: string;
    componentId: string;
    elevatorId: string;
    generationDate: Date;
  };
}

// used in job details section
export type ArticleSectionTableRow = {
  id: string;
  no: number;
  number: string;
  name: string;
  description: string;
  unit: string;
  total: string;
  unitPrice: string;
  quantity: number;
  percent: string;
  navigateTo: string;
  article: ServiceOrderArticleView;
  ownerName: string;
  ownerType: ServiceOrderArticleOwnerType;
  contractNumber: string;
};

export type ArticleTableRow = {
  id: string;
  data: ArticleView;
  number?: string;
  name: string;
  manufacturer: string;
  description?: string;
  category: string;
  type: ArticleType;
  unit: string;
  price: string;
};

export type ArticleStatistics = {
  numOfArticlesPerType: Record<string, number>;
};

export type ArticleFilterForm = {
  unitId?: string;
  sellingPriceMin?: number;
  sellingPriceMax?: number;
  buyingPriceMin?: number;
  buyingPriceMax?: number;
  vatPercentage?: number;
  storageLocation?: string;
  category?: string;
  manufacturer?: string;
};

export type SearchParameters = {
  search?: string;
  storageLocation?: string;
  category?: string;
  manufacturer?: string;
};
