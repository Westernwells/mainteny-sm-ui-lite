import React from 'react';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {SideDrawer} from 'components/SideDrawer';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useEmployeeAccount} from 'hooks/reactQuery/useUserAccount';
import {AddEmployeeForm} from './AddEmployeeForm';
import {EmployeeAccountData} from './AddEmployeeForm/model';

// TODO: Use common components for both Add Employee and Edit Employee

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddEmployee = ({open, setOpen}: Props) => {
  const {user} = useUserSession();
  const {addEmployeeAccount} = useEmployeeAccount();

  const initialValues: EmployeeAccountData = {
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    password: '',
    address: null,
    roles: [],
    serviceOrderTypes: [],
    shifts: [],
    serviceCompanyId: user?.userAccount.serviceCompany.id,
  };

  const phoneValidationRE =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    username: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    phone: Yup.string()
      .required('Phone number is required')
      .matches(phoneValidationRE, 'Phone number is not valid'),
    password: Yup.string().required('Password is required'),
  });

  return (
    <SideDrawer
      open={open}
      setOpen={setOpen}
      header="Add Employee"
      body={
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {resetForm}) => {
            addEmployeeAccount(values, () => {
              resetForm();
              setOpen(false);
            });
          }}>
          <AddEmployeeForm />
        </Formik>
      }
    />
  );
};
