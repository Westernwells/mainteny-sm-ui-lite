import {Amount, Meta, Price} from './misc';

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

export interface ArticleView {
  additionalInfo: ArticleAdditionalInfo;
  category: string;
  description: string;
  id: string;
  manufacturer: string;
  meta: Meta;
  model: string;
  name: string;
  number: string;
  search: string;
  serviceCompanyId: string;
  supplier: string;
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
  supplier: string;
  type: ArticleType;
  unit: string;
  unitPurchaseAmount: Amount;
  unitSellingAmount: Amount;
}

export interface QueryArticleParams {
  pageIndex: number;
  pageSize: number;
  query: string;
}
