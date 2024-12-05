import {CustomerEditForm, CustomerPortalTableRow} from 'models/customer';
import {ContactsView, PORTAL_PERSON_STATUS} from 'models/contacts';
import {convertToText, formatAddressFullname} from './utils';

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
  vat: data?.vat,
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

export const createNameSearchQuery = (value: string) =>
  value
    .split(' ')
    .map((word) => `[name:*${word}*]`)
    .join('');

export const getTaxRate = (taxRate?: {percentage?: number}) =>
  taxRate?.percentage === 0
    ? '0%'
    : taxRate?.percentage
    ? `${taxRate?.percentage}%`
    : '-';

export const aggregateCustomerPortalRow = (
  contactResources: ContactsView[],
): CustomerPortalTableRow[] =>
  contactResources.map((contactResource) => ({
    contactResourceData: contactResource,
    id: contactResource.id,
    customerId: contactResource.userAccount.id,
    name: `${contactResource.userAccount.firstName} ${contactResource.userAccount.lastName}`,
    emailAddress: contactResource.userAccount.contact.email || '-',
    role: contactResource.userAccount.roles.map((role) => convertToText(role)),
    access: contactResource.userAccount.status,
  }));

export const getStatusLabel = (access: string): string | null => {
  switch (access) {
    case PORTAL_PERSON_STATUS.ACTIVE:
      return 'Active';
    case PORTAL_PERSON_STATUS.PENDING:
      return 'Pending';
    case PORTAL_PERSON_STATUS.REVOKED:
      return 'Revoked';
    case PORTAL_PERSON_STATUS.INACTIVE:
      return 'Inactive';
    default:
      return null;
  }
};
