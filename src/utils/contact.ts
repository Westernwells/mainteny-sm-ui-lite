import {
  ContactTableRow,
  ServiceCompanyContactPersonView,
} from 'models/contacts';

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
