import {ArticleType, ExtendedSupplierRecord} from './article';
import {Money} from './misc';

export interface ArticleBasicFormModel {
  category: string;
  manufacturer?: string;
  model?: string;
  name: string;
  externalId: string;
  storageLocation?: string;
  type: ArticleType;
  unit: string;
  unitPurchaseVat: number;
  unitPurchaseAmount: number | string;
  unitPurchaseAmountCurrency: string;
  unitSellingVat: number;
  unitSellingAmount: number | string;
  unitSellingAmountCurrency: string;
  costPackage?: {
    labor: Money;
    material: Money;
  };
  quantity?: number;
}

export interface ArticleDescriptionFormModel {
  description?: string;
}

export interface ArticleStockFormModel {
  currentStock: number;
  maxStock: number;
  minOrderQuantity: number;
  minStock: number;
  suppliers?: ExtendedSupplierRecord[];
}

export interface TestContextExtended {
  from: [
    {
      value: Money;
    },
    {
      value: {
        labor: Money;
        material: Money;
      };
    },
    {
      value: ArticleBasicFormModel;
    },
  ];
}

export enum MeasurementUnit {
  g = 'g',
  kg = 'kg',
  mm = 'mm',
  cm = 'cm',
  m = 'm',
  sqm = 'sqm',
  ml = 'ml',
  l = 'l',
  pcs = 'pcs',
  h = 'h',
  s = 's',
  min = 'min',
}
