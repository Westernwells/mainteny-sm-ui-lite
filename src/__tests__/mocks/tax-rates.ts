import {VatView} from 'models/vat';

export const taxRatesOne: VatView[] = [
  {
    id: '3c4a5e70-a256-4744-b52d-b92105d4d122',
    name: '19%',
    percentage: 19,
    legalNote: 'Test name for 19%',
    isDefault: true,
  },
  {
    id: '9bac97d7-87f5-4110-8c79-62da1108c271',
    name: '7%',
    percentage: 7,
    legalNote: 'Test for 7%',
    isDefault: false,
  },
  {
    id: 'bb422b7f-7b9c-4df4-ae3a-859ee9db4c11',
    name: '0%',
    percentage: 0,
    legalNote: '',
    isDefault: false,
  },
  {
    id: 'bdf0d9ea-b1e1-4975-b78e-22b06f827028',
    name: '§13b UStG 0%',
    percentage: 0,
    legalNote:
      'Steuerschuldnerschaft des Leistungsempfängers gemäß § 13b UStG. Der Leistungsempfänger ist für die Versteuerung der Leistung verantwortlich.',
    isDefault: false,
  },
  {
    id: 'f1d7c5d1-a0e2-4beb-943f-95b42ff2f2c5',
    name: 'Testing 12%',
    percentage: 12,
    legalNote: 'Dies ist ein Testext vom 12% Steuersatz',
    isDefault: false,
  },
];

export const prevTaxRates: Partial<VatView>[] = [
  {
    id: '3c4a5e70-a256-4744-b52d-b92105d4d122',
    name: '19%',
    percentage: 19,
    legalNote: 'Test name for 19%',
    isDefault: true,
  },
  {
    id: '9bac97d7-87f5-4110-8c79-62da1108c271',
    name: '7%',
    percentage: 7,
    legalNote: 'Test for 7%',
    isDefault: false,
  },
  {
    id: 'bb422b7f-7b9c-4df4-ae3a-859ee9db4c11',
    name: '0%',
    percentage: 0,
    legalNote: '',
    isDefault: false,
  },
  {
    id: 'bdf0d9ea-b1e1-4975-b78e-22b06f827028',
    name: '§13b UStG 0%',
    percentage: 0,
    legalNote:
      'Steuerschuldnerschaft des Leistungsempfängers gemäß § 13b UStG. Der Leistungsempfänger ist für die Versteuerung der Leistung verantwortlich.',
    isDefault: false,
  },
];

export const prevTaxRatesTwo: Partial<VatView>[] = [
  {
    id: '9bac97d7-87f5-4110-8c79-62da1108c271',
    percentage: 7,
    name: '7%',
    legalNote: 'Test for 7%',
  },
  {
    id: '3c4a5e70-a256-4744-b52d-b92105d4d122',
    percentage: 19,
    name: '19%',
    legalNote: 'Test name for 19%',
  },
  {
    id: 'f1d7c5d1-a0e2-4beb-943f-95b42ff2f2c5',
    percentage: 12,
    name: 'Testing 12%',
    legalNote: 'Testing 12%',
  },
];
