import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Box, Typography} from '@mui/material';
import {GridRowsProp} from '@mui/x-data-grid';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {Dialog} from 'components/Dialog';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  useEmployeeAccount,
  useQueryUserAccounts,
} from 'hooks/reactQuery/useUserAccount';
import {useServiceManager} from 'hooks/reactQuery/useServiceManager';
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {Role, UserView} from 'models/user';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {columns, makeRows} from './UserDataGridProps';
import {UserFormTypes} from './model';
import {UserForm} from './UserForm';

interface Props {
  companyId: string;
}

const pageSize = 5;

export const UserTable = ({companyId}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const [page, setPage] = useState(makePage(0, pageSize));
  const [pageCount, setPageCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeUser, setActiveUser] = useState<UserView | undefined>(undefined);
  const [typeAction, setTypeAction] = useState<'edit' | 'create' | undefined>(
    undefined,
  );

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    phone: Yup.string()
      .matches(phoneValidationRE, 'Phone number is not valid')
      .required('Phone is required'),
    address: Yup.object().nullable().required('Address is required'),
    ...(typeAction === 'create'
      ? {
          password: Yup.string()
            .required(t('This field is required'))
            .min(8, t('Must be at least 8 characters'))
            .matches(/\d/, t('Must contain 1 digit'))
            .matches(/.*[\W_]/, t('Must contain 1 special character')),
        }
      : {
          password: Yup.string()
            .min(8, t('Must be at least 8 characters'))
            .matches(/\d/, t('Must contain 1 digit'))
            .matches(/.*[\W_]/, t('Must contain 1 special character')),
        }),
  });

  const [rows, setRows] = useState<GridRowsProp>([]);

  const formik = useFormik<UserFormTypes>({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      employeeId: '',
      shifts: [],
      password: '',
      address: null,
    },
    onSubmit: (values, {resetForm}) => {
      resetForm();
    },
    validationSchema,
  });

  const {data: userAccountResource = createEmptyResource<UserView>(pageSize)} =
    useQueryUserAccounts(
      {
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
        query: '',
        roles: [Role.SERVICE_MANAGER],
      },
      {keepPreviousData: true},
      companyId,
    );

  useEffect(() => {
    setRows(makeRows(userAccountResource.data, formatDate));
    setPageCount(Math.ceil(userAccountResource.total / page.pageSize));
  }, [userAccountResource, page.pageSize]);

  const getEditableUser = (item: UserView) => {
    formik.setValues({
      phone: item?.userAccount.contact.phone.replace(/[^\d]/g, '') || '',
      firstName: item?.userAccount.firstName || '',
      lastName: item?.userAccount.lastName || '',
      email: item?.userAccount.contact.email || '',
      employeeId: item?.userData?.externalId,
      shifts: item.userData.workingHours
        ? item.userData.workingHours.map((shift) => ({
            fromTime: shift.fromTime,
            toTime: shift.toTime,
            type: shift.type,
          }))
        : [],
      address: item.userData.address
        ? {
            fullName: item.userData.address.fullName,
            countryCode: item.userData.address.countryCode,
            location: {
              longitude: item.userData.address.location.longitude,
              latitude: item.userData.address.location.latitude,
            },
          }
        : null,
    });
    setTypeAction('edit');
    setActiveUser(item);
    setOpenDialog(true);
  };

  const onCreateUser = () => {
    formik.setValues({
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      shifts: [],
      password: '',
      address: null,
    });

    setActiveUser(undefined);
    setOpenDialog(true);
    setTypeAction('create');
    formik.resetForm();
  };

  const {addEmployeeAccount} = useEmployeeAccount();
  const {updateEmployeeAccount, updateUserPassword} = useEmployeeAccount();

  const updateCurrentEmployee = async () => {
    const body = {
      phone: formik.values.phone,
      roles: ['SERVICE_MANAGER'],
      employeeId: formik.values.employeeId,
      email: formik.values.email,
      shifts: formik.values.shifts,
      firstName: formik.values.firstName,
      lastName: formik.values.lastName,
      address: formik.values.address,
    };

    await updateEmployeeAccount(
      body,
      activeUser?.userData?.employeeId || '',
      () => {
        formik.resetForm();
      },
    );

    if (formik.values.password) {
      await updateUserPassword(
        formik.values.password,
        activeUser?.userAccount?.username || '',
        () => {
          formik.resetForm();
        },
      );
    }
    setOpenDialog(false);
  };

  const saveNewUser = async () => {
    const body = {
      phone: formik.values.phone,
      roles: ['SERVICE_MANAGER'],
      employeeId: formik.values.employeeId,
      shifts: formik.values.shifts,
      firstName: formik.values.firstName,
      lastName: formik.values.lastName,
      password: formik.values.password,
      contact: {
        email: formik.values.email,
        phone: formik.values.phone,
      },
      serviceOrderTypes: [],
      address: formik.values.address,
      serviceCompanyId: companyId,
    };

    await addEmployeeAccount(body, () => {
      formik.resetForm();
    });

    setOpenDialog(false);
  };

  const {getImpersonateUser} = useServiceManager();

  const getUserToken = async (item: UserView) => {
    await getImpersonateUser(item.userAccount.username);
  };

  return (
    <Box>
      <InfoCard
        header={<Typography variant="subtitle1">Users</Typography>}
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '0.5em'}}
        handleAction={onCreateUser}
        headerActionIcon={
          <Typography color="info.main">{t('+ Add')}</Typography>
        }
        showHeaderBackground>
        <DataGridLayout
          fullHeight={false}
          isCellClickable={false}
          height={400}
          rows={rows}
          columns={useCallback(
            () => columns(getEditableUser, getUserToken),
            [],
          )()}
          noRowsEmptySection={
            <EmptySection
              illustration="clipboard"
              size="tiny"
              containerStyle={{my: 'auto'}}
              label="No users yet. They will appear here once added!"
            />
          }
          isWidget
          containerStyle={{
            borderBottom: 'none',
          }}
          hideFooter={pageCount <= 1}
          pageIndex={page.pageIndex + 1}
          pageSize={page.pageSize}
          handlePageSizeChange={(newPageSize: number) =>
            setPage({...page, pageSize: newPageSize})
          }
          handlePageChange={(newPage: number) => {
            setPage({...page, pageIndex: newPage - 1});
          }}
          pageCount={pageCount}
          totalRows={userAccountResource.total}
        />
      </InfoCard>
      <Dialog
        title={typeAction === 'edit' ? 'Edit User' : 'Add User'}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => setOpenDialog(false)}
        onSave={typeAction === 'edit' ? updateCurrentEmployee : saveNewUser}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}>
        <UserForm formik={formik} typeForm={typeAction!} />
      </Dialog>
    </Box>
  );
};
