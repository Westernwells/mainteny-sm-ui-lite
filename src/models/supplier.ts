import {Order} from './pagination';
import {Address, AddressRecord, CompanyContact, Meta} from './misc';

export type SupplierTableRow = {
  id: string;
  externalId: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  email: string;
};

export enum SUPPLIER_ORDER_FIELD {
  EXTERNAL_ID = 'EXTERNAL_ID',
  NAME = 'NAME',
  CATEGORY = 'CATEGORY',
  ADDRESS = 'ADDRESS',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

export interface QueryArticleSuppliersParams {
  serviceCompanyId: string;
  pageIndex: number;
  pageSize: number;
  query: string;
  order?: Order;
  orderBy?: SUPPLIER_ORDER_FIELD;
}

export interface SupplierRecord {
  supplierId?: string;
  number?: string;
  isPreferred?: boolean;
}

export type ExtendedSupplierRecord = SupplierRecord & {id: string};

export type ArticleSupplierView = ArticleSupplierSimpleView & {
  search: string;
  meta: Meta;
  category?: string;
};

export interface ArticleSupplierSimpleView {
  id: string;
  serviceCompanyId: string;
  externalId: string;
  name: string;
  address: Address;
  contact: CompanyContact;
  additionalInfo: string;
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

export interface QuerySupplierCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface SupplierComment {
  content: string;
  subject: string;
}
