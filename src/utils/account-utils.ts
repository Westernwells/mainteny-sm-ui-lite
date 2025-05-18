import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {AvatarView} from 'models/avatar';
import {
  CreateEmployeeAccountData,
  EmployeeAccountData as EditEmployeeAccountData,
} from 'models/employee';
import {generateShiftRestDataFromForm} from 'utils/shift';

export const formatCreateEmployeeAccountData = (
  data: CreateEmployeeAccountData,
) => {
  const userAccount = {
    contact: {
      email: data.contact?.email,
      phone: `+${data.phone}`,
    },
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
    serviceCompanyId: data?.serviceCompanyId || '',
    username: data.contact?.email || '',
    photoUrl: '',
  };

  const employee = {
    address: data.address,
    team: data.team,
    roles: data?.roles || [],
    externalId: data.employeeId || '',
    workingHours: [], // pass additional data to BE not included in the form
    totalYearlyVacationDaysAllowed: data?.totalYearlyVacationDaysAllowed,
    serviceOrderTypes: data?.serviceOrderTypes || [],
  };

  if (employee.team === '') {
    delete employee.team;
  }

  return {userAccount, employee};
};

export const formatUpdateEmployeeAccountData = (
  data: EditEmployeeAccountData,
) => {
  const userAccount = {
    contact: {
      email: data.email,
      phone: `+${data.phone}`,
    },
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
    serviceCompanyId: data.serviceCompanyId,
    username: data.username,
    photoUrl: '',
  };

  const employee = {
    address: data.address,
    serviceOrderTypes: data?.serviceOrderTypes || [],
    workingHours: generateShiftRestDataFromForm(data.shifts),
    roles: data.roles,
    team: data?.team || '',
    externalId: data.employeeId || '',
    totalYearlyVacationDaysAllowed: data?.totalYearlyVacationDaysAllowed,
  };

  return {userAccount, employee};
};

export const getInitials = (
  userAccount: {
    firstName?: string;
    lastName?: string;
  },
  onlyFirstInitial = false,
) => {
  const {firstName, lastName} = userAccount;

  if (!firstName && !lastName) return;

  const nameToUse = firstName || lastName;

  if (onlyFirstInitial || !firstName || !lastName) return nameToUse?.[0];

  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
};

export const convertPropertyOwnerObjectToAvatar = (
  propertyOwner: PropertyOwnerView | PropertyOwnerSimpleView,
): AvatarView => ({
  firstName: propertyOwner?.name,
  photoUrl: propertyOwner.additionalInfo.customerImagePath,
});
