import {Meta} from './misc';
import {Order} from './pagination';

export interface CreateTextBlockRecord {
  serviceCompanyId: string;
  category: string;
  name: string;
  text: string;
}

export interface UpdateTextBlockRecord {
  category?: string;
  name?: string;
  text?: string;
}

export interface TextBlockFilters {}

export interface QueryTextBlockParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  categories: TextBlockCategory[];
  order?: Order;
  orderByField?: TextBlockOrderField;
}

export interface TextBlockView {
  id: string;
  serviceCompanyId: string;
  category: TextBlockCategory;
  name: string;
  text: string;
  search: string;
  additionalInfo: string;
  meta: Meta;
}

export interface TextBlockFormModel {
  name: string;
  category: string;
  text: string;
}

export enum TextBlockOrderField {
  NAME = 'NAME',
  CATEGORY = 'CATEGORY',
  CREATED_AT = 'CREATED_AT',
}

export enum TextBlockCategory {
  QUOTATION = 'QUOTATION',
  INVOICE = 'INVOICE',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  SERVICE_ORDER = 'SERVICE_ORDER',
  EMAIL = 'EMAIL',
}

export interface TextBlockRow {
  id: string;
  NAME: string;
  CATEGORY: string;
  CREATED_AT: string;
  text: string;
  wordCount: number;
  editedAt: string;
}
export const mapJsonToTextBlockView = (json: any): TextBlockView => {
  return {
    id: json.id,
    serviceCompanyId: json.serviceCompanyId,
    category: json['CATEGORY'],
    name: json['NAME'],
    text: json.text,
    search: json.search,
    additionalInfo: json.additionalInfo,
    meta: json.meta,
  };
};

// Converts macro to text, eg: ' SERVICE_ORDER' -> 'Job Detailsr'

export const convertCategoryToText = (macro: string) => {
  const specialCases: {[key: string]: string} = {
    SERVICE_ORDER_REPORT: 'Work Report',
    SERVICE_ORDER: 'Job Details',
  };

  if (specialCases[macro]) {
    return specialCases[macro];
  }

  return macro
    .toLowerCase()
    .split('_')
    .join(' ')
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};

// Converts category text to macro, eg: 'Work Report' -> 'SERVICE_ORDER_REPORT'
export const convertCategoryToMacro = (
  text: string,
): TextBlockCategory | string => {
  const specialCases: {[key: string]: TextBlockCategory} = {
    'Work Report': TextBlockCategory.SERVICE_ORDER_REPORT,
    'Job Details': TextBlockCategory.SERVICE_ORDER,
  };

  if (specialCases[text]) {
    return specialCases[text];
  }

  return text.toUpperCase().split(' ').join('_');
};

export const textBlockCategoryOptions = Object.values(TextBlockCategory).map(
  (category) => convertCategoryToText(category),
);

export const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
