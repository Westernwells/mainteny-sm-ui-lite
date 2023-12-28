import React from 'react';
import {Formik} from 'formik';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useEmployeeAccount} from 'hooks/reactQuery/useUserAccount';
import {UserView, Role} from 'models/user';
import {EditEmployeeForm} from './EditEmployeeForm';
import {EmployeeAccountData} from './EditEmployeeForm/model';

// TODO: Use common components for both Add Employee and Edit Employee

interface Props {
  employee: UserView;
  openDialog: boolean;
  onClose: () => void;
}

export const EditEmployee = ({employee, openDialog, onClose}: Props) => {
  const {user} = useUserSession();
  const {updateEmployeeAccount} = useEmployeeAccount();

  const initialValues: EmployeeAccountData = {
    username: employee.userAccount.username,
    firstName: employee.userAccount.firstName,
    lastName: employee.userAccount.lastName,
    phone:
      employee.userAccount.contact.phone.split('+')[1] ||
      employee.userAccount.contact.phone,
    email: employee.userAccount.contact.email,
    roles: employee.userAccount.roles,
    address: employee.userData.address ? employee.userData.address : null,
    serviceOrderTypes:
      employee.userAccount.roles.includes(Role.TECHNICIAN) &&
      employee.userData.additionalInfo
        ? employee.userData.additionalInfo.assignedServiceOrderTypes || []
        : [],
    shifts:
      employee.userAccount.roles.includes(Role.TECHNICIAN) &&
      employee.userData.workingHours
        ? employee.userData.workingHours.map((item) => ({
            fromTime: item.fromTime,
            toTime: item.toTime,
            type: item.type,
          }))
        : [],
    serviceCompanyId: user?.userAccount.serviceCompany.id,
    employeeId: employee.userData.externalId,
    team: employee.userData.team,
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, {resetForm}) => {
        updateEmployeeAccount(values, employee.userData.employeeId, () => {
          resetForm();
          onClose();
        });
      }}>
      <EditEmployeeForm openDialog={openDialog} onClose={onClose} />
    </Formik>
  );
};
