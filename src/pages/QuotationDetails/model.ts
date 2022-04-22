export interface CustomerView {
  name: string;
  customerNumber: string;
  address: string;
  unitCount: string;
  phone: string;
}

export interface UnitView {
  unitName: string;
  lastVisit: string;
  nextVisit: string;
  availability: string;
  status: string;
  address: string;
}

export interface ArticleView {
  articleNumber: string;
  type: string;
  model: string;
  manifacturer: string;
  description: string;
  unitPrice: string;
  // TODO: Remove this later
  unitPriceNumber: number;
  quantity: number;
}
