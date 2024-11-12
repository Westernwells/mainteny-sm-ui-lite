import {CustomerEditForm} from 'pages/CustomerDetails/Tabs/CustomerOverview/EditCustomerForm/model';
import {formatAddressFullname} from './utils';

export const formatPhoneNumber = (phoneNumber: string) =>
  `+${phoneNumber.replaceAll('+', '')}`;

export const phoneNumberDigitsOnly = (phoneNumber: string) =>
  phoneNumber.replace(/[^\d]/g, '');

export const formatUpdateCustomer = (data: CustomerEditForm) => ({
  billingAddress: formatAddressFullname(data.billingAddress),
  beneficiaryAddress: formatAddressFullname(data.beneficiaryAddress),
  otherAddress: formatAddressFullname(data.otherAddress),
  contact: {
    email: data.email,
    phone: data.phone ? formatPhoneNumber(data.phone) : '',
    url: data.url,
  },
  billingEmail: data.billingEmail,
  externalId: data.externalId,
  name: data.name,
  priority: data.priority || 'NONE',
  costCenter: data.costCenter,
  registrationDate: data.registrationDate,
  secondaryPhoneNumber: data.secondaryPhoneNumber
    ? formatPhoneNumber(data.secondaryPhoneNumber)
    : '',
  vatId: data.vatId,
  offsettingAccount: data.offsettingAccount,
  paymentTermId: data?.paymentTermId,
  customerPortalEnabled: data?.customerPortalEnabled,
  buyerReference: data?.buyerReference,
  invoiceFormat: data?.invoiceFormat,
});

export const getFilterUnitNumber = (value: string, type: 'start' | 'end') => {
  if (value === '0 - 5') {
    if (type === 'start') {
      return 0;
    }
    if (type === 'end') {
      return 5;
    }
  } else if (value === '5 - 20') {
    if (type === 'start') {
      return 5;
    }
    if (type === 'end') {
      return 20;
    }
  } else if (value === '20 - 100') {
    if (type === 'start') {
      return 20;
    }
    if (type === 'end') {
      return 100;
    }
  } else if (value === '100+') {
    if (type === 'start') {
      return 100;
    }
    if (type === 'end') {
      return 1000000;
    }
  }
};

export const createNameSearchQuery = (value: string) => `[name:*${value}*]`;
