import {
  ContactTableRow,
  RefContactPersonView,
  RefContactTableRow,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {convertToText} from './utils';

export const aggregateContactRow = (
  contacts: ServiceCompanyContactPersonView[],
): ContactTableRow[] =>
  contacts.map((contact) => ({
    data: contact,
    id: contact.id,
    number: contact.externalId,
    companyName: contact.companyName,
    userAccount: contact.userAccount,
    email: contact.userAccount.contact.email,
    primaryPhone: contact.userAccount.contact.phone,
    secondaryPhone: contact.additionalInfo.secondaryPhone,
    roles: contact.userAccount.roles,
    hasComments: !contact.commentCount ? false : contact.commentCount > 0,
  }));

export const aggregateCustomerContactsRow = (
  contactResources?: RefContactPersonView[],
): RefContactTableRow[] =>
  contactResources?.map((contactResource) => ({
    contactResourceData: contactResource,
    id: contactResource.id,
    contactId: contactResource.userAccount.id,
    userAccount: contactResource.userAccount,
    company: contactResource.companyName || '-',
    phone: contactResource.userAccount.contact.phone || '-',
    secondaryPhoneNumber: contactResource.additionalInfo.secondaryPhone || '-',
    emailAddress: contactResource.userAccount?.contact?.email || '-',
    role: contactResource.userAccount.roles.map((role) => convertToText(role)),
  })) || [];
