import {CustomerEditForm} from 'pages/CustomerDetails/Tabs/CustomerOverview/EditCustomerForm/model';

export const formatUpdateCustomer = (data: CustomerEditForm) => ({
  billingAddress: data.billingAddress,
  businessAddress: data.businessAddress,
  contact: {
    email: data.email,
    phone: `+${data.phone.replaceAll('+', '')}`,
    url: data.url,
  },
  externalId: data.externalId,
  name: data.name,
  postalAddress: data.postalAddress,
  priority: data.priority || 'NONE',
});

export const getFilterUnitNumber = (value: string, type: 'start' | 'end') => {
  if (value === '0 - 500') {
    if (type === 'start') {
      return 0;
    }
    if (type === 'end') {
      return 500;
    }
  } else if (value === '500 - 1000') {
    if (type === 'start') {
      return 500;
    }
    if (type === 'end') {
      return 1000;
    }
  } else if (value === '1000 - 5000') {
    if (type === 'start') {
      return 1000;
    }
    if (type === 'end') {
      return 5000;
    }
  } else if (value === '> 5000') {
    if (type === 'start') {
      return 5000;
    }
    if (type === 'end') {
      return 1000000;
    }
  }
};
