import {Role} from 'models/user';
import {EmployeeAccountData} from 'pages/Employee/AddEmployeeForm/model';
import {EmployeeAccountData as EditEmployeeAccountData} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/model';

export const formatEmployeeAccountData = (data: EmployeeAccountData) => {
  const userAccount = {
    contact: {
      email: data.username,
      phone: `+${data.phone}`,
    },
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
    serviceCompanyId: data.serviceCompanyId,
    username: data.username,
    photoUrl: '',
  };
  const technician = {
    address: data.address,
    serviceOrderTypes: data.serviceOrderTypes,
    workingHours: data.shifts,
  };

  let body = {};

  if (data.roles.includes(Role.SERVICE_MANAGER)) {
    body = {userAccount};
    if (data.roles.includes(Role.TECHNICIAN)) {
      body = {...body, technician};
    }
  } else if (data.roles.includes(Role.TECHNICIAN)) {
    body = {userAccount, technician};
  } else {
    console.error('Invalid Account Details');
  }
  return body;
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
  const technician = {
    address: data.address,
    serviceOrderTypes: data.serviceOrderTypes,
    workingHours: data.shifts,
  };

  let body = {};

  if (data.roles.includes(Role.SERVICE_MANAGER)) {
    body = {userAccount};
    if (data.roles.includes(Role.TECHNICIAN)) {
      body = {...body, technician};
    }
  } else if (data.roles.includes(Role.TECHNICIAN)) {
    body = {userAccount, technician};
  } else {
    console.error('Invalid Account Details');
  }
  return body;
};
