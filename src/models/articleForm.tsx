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
