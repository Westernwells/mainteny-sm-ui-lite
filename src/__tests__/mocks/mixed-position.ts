import type {EditableQuotationItem} from 'models/quotation';

export const oldItemsForVatChange: Partial<EditableQuotationItem>[] = [
  {
    id: '55cd9c41-5bde-4e80-b3a8-f65496b655b9',
    unitAmount: {
      netAmount: 6000,
      grossAmount: 7140,
      vat: 1140,
      currency: 'EUR',
      percentageVat: 19,
      vatId: '3c4a5e70-a256-4744-b52d-b92105d4d122',
      vatName: '19%',
    },
  },
  {
    id: '03cfeb37-2caa-4066-a92b-af1e0547aec4',
    unitAmount: {
      netAmount: 6000,
      grossAmount: 6000,
      vat: 0,
      currency: 'EUR',
      percentageVat: 0,
      vatId: 'bb422b7f-7b9c-4df4-ae3a-859ee9db4c11',
      vatName: '§13b UStG 0%',
    },
  },
];

export const newItemsForVatChange: Partial<EditableQuotationItem>[] = [
  {
    id: '5e78c6e1-1534-43f4-83f8-a5e8588c2527',
    unitAmount: {
      netAmount: 5000,
      grossAmount: 5350,
      vat: 350,
      currency: 'EUR',
      percentageVat: 7,
      vatId: '9bac97d7-87f5-4110-8c79-62da1108c271',
      vatName: '7%',
    },
  },
  {
    id: '03cfeb37-2caa-4066-a92b-af1e0547aec4',
    unitAmount: {
      netAmount: 6000,
      grossAmount: 6000,
      vat: 0,
      currency: 'EUR',
      percentageVat: 0,
      vatId: 'bb422b7f-7b9c-4df4-ae3a-859ee9db4c11',
      vatName: '§13b UStG 0%',
    },
  },
];

export const oldItemsForObsoleteVat: Partial<EditableQuotationItem>[] = [
  {
    id: '5e78c6e1-1534-43f4-83f8-a5e8588c2527',
    unitAmount: {
      netAmount: 5000,
      grossAmount: 5350,
      vat: 350,
      currency: 'EUR',
      percentageVat: 7,
      vatId: '9bac97d7-87f5-4110-8c79-62da1108c271',
      vatName: '7%',
    },
  },
  {
    id: '55cd9c41-5bde-4e80-b3a8-f65496b655b9',
    unitAmount: {
      netAmount: 6000,
      grossAmount: 7140,
      vat: 1140,
      currency: 'EUR',
      percentageVat: 19,
      vatId: '3c4a5e70-a256-4744-b52d-b92105d4d122',
      vatName: '19%',
    },
  },
];

export const newItemsForObsoleteVat: Partial<EditableQuotationItem>[] = [
  {
    id: '5e78c6e1-1534-43f4-83f8-a5e8588c2527',
    unitAmount: {
      netAmount: 5000,
      grossAmount: 5350,
      vat: 350,
      currency: 'EUR',
      percentageVat: 7,
      vatId: '9bac97d7-87f5-4110-8c79-62da1108c271',
      vatName: '7%',
    },
  },
  {
    id: 'd71d5816-7917-420c-96fd-ee32a9a7bf3e',
    unitAmount: {
      netAmount: 5000,
      grossAmount: 5600,
      vat: 600,
      currency: 'EUR',
      percentageVat: 12,
      vatId: 'f1d7c5d1-a0e2-4beb-943f-95b42ff2f2c5',
      vatName: 'Testing 12%',
    },
  },
];

export const oldItemsForUnchangedVat: Partial<EditableQuotationItem>[] = [
  {
    id: '741e9759-cbb2-4754-972b-a0a7f9205f29',
    unitAmount: {
      netAmount: 6000,
      grossAmount: 6000,
      vat: 0,
      currency: 'EUR',
      percentageVat: 0,
      vatId: 'bb422b7f-7b9c-4df4-ae3a-859ee9db4c11',
      vatName: '§13b UStG 0%',
    },
  },
  {
    id: '8dcfbc74-aea5-4816-873e-bd71c4514ecd',
    unitAmount: {
      netAmount: 5000,
      grossAmount: 5350,
      vat: 350,
      currency: 'EUR',
      percentageVat: 7,
      vatId: '9bac97d7-87f5-4110-8c79-62da1108c271',
      vatName: '7%',
    },
  },
];

export const newItemsForUnchangedVat: Partial<EditableQuotationItem>[] = [
  {
    id: '741e9759-cbb2-4754-972b-a0a7f9205f29',
    unitAmount: {
      netAmount: 6000,
      grossAmount: 6000,
      vat: 0,
      currency: 'EUR',
      percentageVat: 0,
      vatId: 'bb422b7f-7b9c-4df4-ae3a-859ee9db4c11',
      vatName: '§13b UStG 0%',
    },
  },
  {
    id: '8dcfbc74-aea5-4816-873e-bd71c4514ecd',
    unitAmount: {
      netAmount: 5000,
      grossAmount: 5350,
      vat: 350,
      currency: 'EUR',
      percentageVat: 7,
      vatId: '9bac97d7-87f5-4110-8c79-62da1108c271',
      vatName: '7%',
    },
  },
];
