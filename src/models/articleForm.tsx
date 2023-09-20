import {Money} from './misc';

export interface ArticleBasicFormModel {
  category: string;
  manufacturer?: string;
  model?: string;
  name: string;
  externalId: string;
  storageLocation?: string;
  type: string;
  unit: string;
  unitPurchaseVat: number;
  unitPurchaseAmount: number;
  unitPurchaseAmountCurrency: string;
  unitSellingVat: number;
  unitSellingAmount: number;
  unitSellingAmountCurrency: string;
  costPackage?: {
    labor: Money;
    material: Money;
  };
}

export interface ArticleDescriptionFormModel {
  description?: string;
}

export interface ArticleStockFormModel {
  currentStock: number;
  maxStock: number;
  minOrderQuantity: number;
  minStock: number;
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
  'Hours (hr)' = 'Hours (hr)',
  'Square Meters (sq m)' = 'Square Meters (sq m)',
  'Linear Meters (m)' = 'Linear Meters (m)',
  'Cubic Meters (cu m)' = 'Cubic Meters (cu m)',
  'Pieces or Units (ea)' = 'Pieces or Units (ea)',
  'Liters (L)' = 'Liters (L)',
  'Kilograms (kg)' = 'Kilograms (kg)',
  'Cubic Feet (cu ft)' = 'Cubic Feet (cu ft)',
  'Milliliters (ml)' = 'Milliliters (ml)',
  'Each (ea)' = 'Each (ea)',
  'Sets' = 'Sets',
  'Appliances (ea)' = 'Appliances (ea)',
  'Vehicles (ea)' = 'Vehicles (ea)',
}
