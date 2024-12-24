import {ArticleType, CostPackage} from 'models/article';

export interface EditArticleFormModel {
  name: string;
  unit: string;
  unitSellingAmount: number;
  quantity: number;
  type: ArticleType;
  costPackage?: CostPackage;
  unitPurchaseAmountCurrency: string;
  externalId?: string;
  description?: string;
  unitPurchaseAmount?: number;
  percentageVat?: number;
}
