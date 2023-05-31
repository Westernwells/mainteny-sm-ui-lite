import {CustomerEditForm} from 'pages/CustomerDetails/Tabs/CustomerOverview/EditCustomerForm/model';

export const formatPhoneNumber = (phoneNumber: string) =>
  `+${phoneNumber.replaceAll('+', '')}`;

export const formatUpdateCustomer = (data: CustomerEditForm) => ({
  billingAddress: data.billingAddress,
  businessAddress: data.businessAddress,
  contact: {
    email: data.email,
    phone: formatPhoneNumber(data.phone),
    url: data.url,
  },
  billingEmail: data.billingEmail,
  externalId: data.externalId,
  name: data.name,
  postalAddress: data.postalAddress,
  priority: data.priority || 'NONE',
  costCenter: data.costCenter,
  registrationDate: data.registrationDate,
  secondaryPhoneNumber: data.secondaryPhoneNumber
    ? formatPhoneNumber(data.secondaryPhoneNumber)
    : '',
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
