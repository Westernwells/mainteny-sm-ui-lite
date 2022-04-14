import {Meta, Price} from './misc';

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
}

export interface AritcleView {
  additionalInfo: ArticleAdditionalInfo;
  category: string;
  description: string;
  id: string;
  manufacture: string;
  meta: Meta;
  model: string;
  name: string;
  number: string;
  search: string;
  serviceCompanyId: string;
  supplier: string;
  type: ArticleType;
  unit: string;
  unitPurchasePrice: Price;
  unitSalesPrice: Price;
}

export interface AritcleViewItem {
  article: AritcleView;
  quantity: number;
}

export interface Article {
  items: ArticleAdditionalInfo;
  category: string;
  childArticles: AritcleViewItem[];
  description: string;
  id: string;
  manufacture: string;
  meta: Meta;
  model: string;
  name: string;
  number: string;
  search: string;
  serviceCompanyId: string;
  supplier: string;
  type: ArticleType;
  unit: string;
  unitPurchasePrice: Price;
  unitSalesPrice: Price;
}
