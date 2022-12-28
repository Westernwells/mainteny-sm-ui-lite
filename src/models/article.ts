import {FileResource, FileResourceRecord} from './media';
import {
  Amount,
  AmountRecord,
  Meta,
  Price,
  Address,
  AddressRecord,
  CompanyContact,
} from './misc';

export enum ArticleType {
  PACKAGE = 'PACKAGE',
  PART = 'PART',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export interface ArticleItem {
  articleId: string;
  quantity: number;
}

export interface ArticleAdditionalInfo {
  items: ArticleItem[];
  pictureUrls: string[];
  qrCode: FileResource;
  suppliers: Supplier[];
}

export interface ArticleView {
  additionalInfo: ArticleAdditionalInfo;
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
  stock: Stock;
  storageLocation: string;
  subCategory: string;
  type: ArticleType;
  unit: string;
  unitPurchaseAmount: Amount;
  unitSellingAmount: Amount;
}

export interface ArticleViewItem {
  article: ArticleView;
  quantity: number;
}

export interface Article {
  additionalInfo: ArticleAdditionalInfo;
  category: string;
  childArticles?: ArticleViewItem[];
  description: string;
  id: string;
  manufacturer: string;
  meta: Meta;
  model: string;
  name: string;
  number: string;
  search: string;
  serviceCompanyId: string;
  supplier: Supplier;
  type: ArticleType;
  unit: string;
  unitPurchaseAmount: Amount;
  unitSellingAmount: Amount;
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
}

export interface UpdateArticleRecord {
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
  unitPurchaseAmount?: AmountRecord;
  unitSellingAmount: AmountRecord;
}

export interface QueryArticleParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
  type?: string;
  manufacturer?: string;
  supplier?: string;
}

export interface Stock {
  currentStock: number;
  maxStock: number;
  minOrderQuantity: number;
  minStock: number;
}

export interface Supplier {
  name: string;
  number: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  isPreferred: boolean;
}

export interface SupplierRecord {
  name: string;
  number: string;
  email: string;
  phone: string;
  website: string;
  address?: AddressRecord;
  isPreferred: boolean;
}
export interface ServiceOrderArticleRecord {
  articleId: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: AmountRecord;
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
  address: Address;
  contact: CompanyContact;
  additionalInfo: string;
  search: string;
  meta: Meta;
}
