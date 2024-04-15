import {useEffect, useState} from 'react';
import {Formik, useFormik} from 'formik';
import * as Yup from 'yup';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useEmployeeAccount,
  useQueryUserAccounts,
} from 'hooks/reactQuery/useUserAccount';
import {UserView, Role} from 'models/user';
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {createEmptyResource} from 'utils/paging-utils';
import {getRoles} from 'utils/work-hours-utils';
import {EmployeeAccountData} from './EditEmployeeForm/model';
import {EditEmployeeForm} from './EditEmployeeForm';

interface Props {
  employee: UserView;
  openDialog: boolean;
  onClose: () => void;
}

export const EditEmployee = ({employee, openDialog, onClose}: Props) => {
  const {user} = useUserSession();
  const {updateEmployeeAccount} = useEmployeeAccount();

  const [initialEmployeeId, setInitialEmployeeId] = useState('');
  const [currentEmployeeId, setCurrentEmployeeId] = useState('');

  const {data: userAccountResource = createEmptyResource<UserView>(25)} =
    useQueryUserAccounts(
      {
        pageIndex: 0,
        pageSize: 25,
        query: currentEmployeeId,
        roles: getRoles(''),
      },
      {keepPreviousData: true},
    );

  const isExternalIdUnique = async (resource: UserView[], value?: string) => {
    if (!value) {
      return true;
    }
    try {
      return !(
        resource && resource.some((item) => item.userData.externalId === value)
      );
    } catch (error) {
      console.error('Error checking externalId uniqueness:', error);
      return true;
    }
  };

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
    shifts: employee.userData.workingHours
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

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    team: Yup.string().matches(/^[0-9]+$/, 'Team is not valid'),
    address: Yup.object().nullable().required('Address is required'),
    phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
    employeeId: Yup.string().test(
      'checkExternalId',
      'This ID is already taken. Please enter a different one.',
      async (value) => {
        if (value !== initialEmployeeId) {
          return isExternalIdUnique(userAccountResource.data, value);
        }
        return true;
      },
    ),
  });

  const handleSubmit = async (values: EmployeeAccountData) => {
    const body = {
      ...values,
      username: values?.email,
    };
    updateEmployeeAccount(body, employee.userData.employeeId, () => {
      onClose();
    });
  };

  const formik = useFormik<EmployeeAccountData>({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema,
  });

  useEffect(() => {
    setInitialEmployeeId(formik.values.employeeId);
  }, []);

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}>
      <EditEmployeeForm
        openDialog={openDialog}
        onClose={onClose}
        setCurrentEmployeeId={setCurrentEmployeeId}
      />
    </Formik>
  );
};
