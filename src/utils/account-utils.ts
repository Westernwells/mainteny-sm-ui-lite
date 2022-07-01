import {EmployeeAccountData} from 'pages/NewEmployee/model';

import {EmployeeAccountData as EditEmployeeAccountData} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/model';

export const formatEmployeeAccountData = (data: EmployeeAccountData) => {
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
    serviceOrderTypes: data.serviceOrderTypes,
    workingHours: data.shifts,
    team: data.team,
    roles: data?.roles || [],
    externalId: data.employeeId || '',
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
    workingHours: data.shifts,
    roles: data.roles,
    team: data?.team || '',
    externalId: data.employeeId || '',
  };

  return {userAccount, employee};
};
