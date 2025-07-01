import {UserAccountSimpleView, UserAccountView} from 'models/user';

export const convertUserAccountsToSimpleView = (
  userAccount: UserAccountView,
): UserAccountSimpleView => ({
  id: userAccount.id,
  username: userAccount.username,
  firstName: userAccount.firstName,
  lastName: userAccount.lastName,
  photoUrl: userAccount.photoUrl,
  contact: userAccount.contact,
  title: userAccount.title,
  serviceCompanyId: userAccount.serviceCompany?.id,
  roles: userAccount.roles,
  status: userAccount.status,
  category: userAccount.category || '',
});
