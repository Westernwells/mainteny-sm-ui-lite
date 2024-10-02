import {ArticleType} from './article';
import {Money} from './misc';
import {ExtendedSupplierRecord} from './supplier';

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
    labor?: Money;
    material?: Money;
    laborPercentage?: number;
    materialPercentage?: number;
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
  pack = 'pack',
  km = 'km',
  UE = 'UE',
  'fixed fee' = 'fixed fee',
}

export const createMeasurementOptions = (
  selectedLang: string,
  excludedItem: MeasurementUnit,
) =>
  Object.keys(MeasurementUnit)
    .filter((item) => !(selectedLang === 'EN' && item === excludedItem))
    .map((item) => ({
      label: item,
      value: item,
    }));
