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
  unitSellingVat: number;
  unitSellingAmount: number;
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
