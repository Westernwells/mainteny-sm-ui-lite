import React from 'react';
import {Formik} from 'formik';
import * as Yup from 'yup';

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

  const phoneValidationRE =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    team: Yup.string().matches(/^[0-9]+$/, 'Team is not valid'),
    address: Yup.object().nullable().required('Address is required'),
    phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
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
