import {AddressRecord, DispatchStrategy} from 'models/misc';

export type BasicInformationFormModel = {
  name: string;
  phone: string;
  billingAddress: AddressRecord | null;
  url: string;
  email: string;
  postalAddress: AddressRecord | null;
  businessAddress: AddressRecord | null;
};

export type SettingsFormModel = {
  language: string;
  dateFormat: string;
  timeFormat: string;
  timeZone: string;
  companyDispatchStrategy: DispatchStrategy | string;
  nightlyShuffleEnabled: boolean;
  totalYearlyVacationDaysAllowed: number | string;
};

export type CompanyInformationFormModel = {
  managingDirector: string;
  arbitrationCourt: string;
  tradeRegisterNumber: string;
};

export type PaymentFormModel = {
  iban: string;
  bic: string;
  accountNumber: string;
  vatId: string;
  percentageVat: number | string;
};

export type NewServiceCompanyBody = {
  billingAddress: AddressRecord | null;
  businessAddress: AddressRecord | null;
  postalAddress: AddressRecord | null;
  name: string;
  phone: string;
  email: string;
  url: string;
  language: string;
  totalYearlyVacationDaysAllowed: number;
  dateFormat: string;
  timeFormat: string;
  paymentInfo: {
    iban: string;
    bic: string;
    accountNumber: string;
  };
  managingDirector: string;
  arbitrationCourt: string;
  tradeRegisterNumber: string;
  vatId: string;
  percentageVat: number;
  timezone: string;
  currencies: string[];
};
