import {ArticleType} from 'models/article';
import {
  EditableInvoiceItem,
  InvoiceItemAmount,
  InvoiceSubItemAmount,
  InvoiceItemPaymentType,
} from 'models/invoice';
import type {ArticleInfoRecord, QuotationSubItemRecord} from 'models/quotation';

export const makeAmount = (net: number, vat: number = 0) => ({
  netAmount: net,
  grossAmount: net,
  currency: 'EUR',
  vats: [
    {
      vat,
      percentageVat: 0,
    },
  ],
  fractionDigits: 2,
  vat,
  percentageVat: 0,
});

export const makePayment = (net: number) => ({
  type: InvoiceItemPaymentType.PERCENTAGE,
  amount: makeAmount(net, 0),
  percentage: 100,
});

export const uiItemLabor: Partial<EditableInvoiceItem> = {
  article: {type: ArticleType.LABOR} as ArticleInfoRecord,
};

export const uiItemMaterial: Partial<EditableInvoiceItem> = {
  article: {type: ArticleType.MATERIAL} as ArticleInfoRecord,
};

export const uiItemPackage50And50: Partial<EditableInvoiceItem> = {
  article: {
    type: ArticleType.PACKAGE,
    costPackage: {
      labor: {value: 0, currency: 'EUR', fractionDigits: 2},
      material: {value: 0, currency: 'EUR', fractionDigits: 2},
      laborPercentage: 50,
      materialPercentage: 50,
    },
  } as ArticleInfoRecord,
};

const subLabor: Partial<QuotationSubItemRecord> = {
  article: {type: ArticleType.LABOR} as ArticleInfoRecord,
  id: 'aaaaaaaa-aaaa-4aaa-bbbb-cccccccccccc',
  name: 'Sub Labor',
  unitAmount: makeAmount(0),
  unitPurchaseAmount: makeAmount(0),
  quantity: 1,
};
const subMaterial: Partial<QuotationSubItemRecord> = {
  article: {type: ArticleType.MATERIAL} as ArticleInfoRecord,
  id: 'bbbbbbbb-bbbb-4bbb-cccc-dddddddddddd',
  name: 'Sub Material',
  unitAmount: makeAmount(0),
  unitPurchaseAmount: makeAmount(0),
  quantity: 1,
};
export const uiItemMixLaborMaterial: Partial<EditableInvoiceItem> = {
  article: {type: ArticleType.MIX} as ArticleInfoRecord,
  subItems: [
    subLabor as QuotationSubItemRecord,
    subMaterial as QuotationSubItemRecord,
  ],
};

const subPackage40And60: Partial<QuotationSubItemRecord> = {
  article: {
    type: ArticleType.PACKAGE,
    costPackage: {
      labor: {value: 0, currency: 'EUR', fractionDigits: 2},
      material: {value: 0, currency: 'EUR', fractionDigits: 2},
      laborPercentage: 40,
      materialPercentage: 60,
    },
  } as ArticleInfoRecord,
  id: 'cccccccc-cccc-4ccc-dddd-eeeeeeeeeeee',
  name: 'Sub Package',
  unitAmount: makeAmount(0),
  unitPurchaseAmount: makeAmount(0),
  quantity: 1,
};
export const uiItemMixPackage40And60: Partial<EditableInvoiceItem> = {
  article: {type: ArticleType.MIX} as ArticleInfoRecord,
  subItems: [subPackage40And60 as QuotationSubItemRecord],
};

export const uiItemComboLabor: Partial<EditableInvoiceItem> = {
  article: {type: ArticleType.LABOR} as ArticleInfoRecord,
};
export const uiItemComboPackage25And75: Partial<EditableInvoiceItem> = {
  article: {
    type: ArticleType.PACKAGE,
    costPackage: {
      labor: {value: 0, currency: 'EUR', fractionDigits: 2},
      material: {value: 0, currency: 'EUR', fractionDigits: 2},
      laborPercentage: 25,
      materialPercentage: 75,
    },
  } as ArticleInfoRecord,
};

const comboMixSub1: Partial<QuotationSubItemRecord> = {
  article: {type: ArticleType.MATERIAL} as ArticleInfoRecord,
  id: 'dddddddd-dddd-4ddd-eeee-ffffffffffff',
  name: 'Mix Sub Material',
  unitAmount: makeAmount(0),
  unitPurchaseAmount: makeAmount(0),
  quantity: 1,
};
const comboMixSub2: Partial<QuotationSubItemRecord> = {
  article: {
    type: ArticleType.PACKAGE,
    costPackage: {
      labor: {value: 0, currency: 'EUR', fractionDigits: 2},
      material: {value: 0, currency: 'EUR', fractionDigits: 2},
      laborPercentage: 10,
      materialPercentage: 90,
    },
  } as ArticleInfoRecord,
  id: 'eeeeeeee-eeee-4eee-ffff-gggggggggggg',
  name: 'Mix Sub Package',
  unitAmount: makeAmount(0),
  unitPurchaseAmount: makeAmount(0),
  quantity: 1,
};
export const uiItemComboMix: Partial<EditableInvoiceItem> = {
  article: {type: ArticleType.MIX} as ArticleInfoRecord,
  subItems: [
    comboMixSub1 as QuotationSubItemRecord,
    comboMixSub2 as QuotationSubItemRecord,
  ],
};

export const detailLabor100: Partial<InvoiceItemAmount> = {
  payment: makePayment(100),
};
export const detailMaterial250: Partial<InvoiceItemAmount> = {
  payment: makePayment(250),
};
export const detailPackage200: Partial<InvoiceItemAmount> = {
  payment: makePayment(200),
};
export const detailPackage120: Partial<InvoiceItemAmount> = {
  payment: makePayment(120),
};
export const detailPayment50: Partial<InvoiceItemAmount> = {
  payment: makePayment(50),
};

export const subPayment70: Partial<InvoiceSubItemAmount> = {
  payment: makePayment(70),
};
export const subPayment30: Partial<InvoiceSubItemAmount> = {
  payment: makePayment(30),
};
export const subPayment80: Partial<InvoiceSubItemAmount> = {
  payment: makePayment(80),
};
export const subPayment100: Partial<InvoiceSubItemAmount> = {
  payment: makePayment(100),
};
