import {FileResource, FileResourceRecord} from './media';
import {
  Amount,
  AmountRecord,
  Meta,
  Price,
  Address,
  AddressRecord,
  CompanyContact,
  PdfGenerationStatus,
  Money,
} from './misc';

export enum ArticleType {
  LABOR = 'LABOR',
  MATERIAL = 'MATERIAL',
  PACKAGE = 'PACKAGE',
}

export interface ArticleItem {
  articleId: string;
  quantity: number;
}

export interface CostPackage {
  labor: Money;
  material: Money;
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
  unitPurchaseAmount: Amount;
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
    labor: Money;
    material: Money;
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
}

export interface QueryArticleParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
  type?: ArticleType[];
  manufacturer?: string;
  supplier?: string;
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

export interface SupplierRecord {
  supplierId?: string;
  number?: string;
  isPreferred?: boolean;
}

export type ExtendedSupplierRecord = SupplierRecord & {id: string};

export interface ServiceOrderArticleRecord {
  articleId: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: AmountRecord;
  article: ArticleRecord;
}

export interface UpdateServiceOrderArticleItem {
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
}

export interface CreateArticleOrderRecord {
  serviceCompanyId: string;
  externalId: string;
  articleSupplierId: string;
  description: string;
  items: ArticleOrderItemRecord[];
}

export interface ArticleSupplierView {
  id: string;
  serviceCompanyId: string;
  externalId: string;
  name: string;
  address?: Address;
  contact: CompanyContact;
  additionalInfo: string;
  search: string;
  meta: Meta;
  category?: string;
}

export interface ArticleSupplierSimpleView {
  id: string;
  serviceCompanyId: string;
  externalId: string;
  name: string;
  address: Address;
  contact: CompanyContact;
  additionalInfo: string;
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
  article: ArticleSimpleView;
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
  status: ArticleOrderStatus;
  items: ArticleOrderItemView;
  additionalInfo: ArticleOrderAdditionalInfo;
  search: string;
  meta: Meta;
}

export interface CreateArticleSupplierRecord {
  serviceCompanyId: string;
  externalId: string;
  name: string;
  email: string;
  phone: string;
  url: string;
  address: AddressRecord;
  category: string;
}

export interface UpdateArticleSupplierRecord {
  externalId?: string;
  name?: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: AddressRecord;
  category?: string;
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
  name: string;
  externalId: string;
  type: ArticleType;
  unit: string;
  unitSellingAmount: AmountRecord;
  costPackage?: CostPackage;
}
