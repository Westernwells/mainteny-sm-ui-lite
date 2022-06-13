import {UserQueryParams} from 'models/employee';
import {Resource} from 'models/misc';
import {UserView, Role} from 'models/user';
import {EmployeeAccountData} from 'pages/Employee/AddEmployeeForm/model';
import {EmployeeAccountData as EditEmployeeAccountData} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/model';
import {useQuery} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {useSnackbar} from 'notistack';
import {
  formatEmployeeAccountData,
  formatUpdateEmployeeAccountData,
} from 'utils/account-utils';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const queryUserAccounts = async (
  params: UserQueryParams,
  serviceCompanyId: string,
) => {
  const response = await axiosClient.get<Resource<UserView>>(
    `/api/serviceCompanies/${serviceCompanyId}/users`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useQueryUserAccounts = (
  params: UserQueryParams,
  options?: any,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery(
    [qks.queryUserAccounts, params],
    () => queryUserAccounts(params, serviceCompanyId!),
    {
      ...options,
      enabled: !!serviceCompanyId,
    },
  );
};

export const getUserAccount = async (id: string) => {
  const response = await axiosClient.get<UserView>(`/api/users/${id}`);
  return response.data;
};

export const useGetUserAccount = (id?: string) =>
  useQuery([qks.getUserAccount, id], () => getUserAccount(id!), {
    enabled: !!id,
  });

export const useEmployeeAccount = () => {
  const {enqueueSnackbar} = useSnackbar();

  const addEmployeeAccount = async (
    accountData: EmployeeAccountData,
    onSuccess?: () => void,
  ): Promise<void> => {
    const urlEndpoint = accountData.roles.includes(Role.SERVICE_MANAGER)
      ? `/api/users/serviceManagers`
      : `/api/users/technicians`;

    const requestBody = formatEmployeeAccountData(accountData);

    try {
      const {status} = await axiosClient.post(urlEndpoint, requestBody);

      if (status === 200) {
        enqueueSnackbar(
          `User account for ${accountData.firstName} created successfully!`,
          {
            variant: 'success',
          },
        );
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        error.response?.message ||
          'Sorry! User account creation failed. Please try again.',
        {
          variant: 'error',
        },
      );
    }
  };

  const updateEmployeeAccount = async (
    accountData: EditEmployeeAccountData,
    onSuccess?: () => void,
  ): Promise<void> => {
    const urlEndpoint = accountData.roles.includes(Role.SERVICE_MANAGER)
      ? `/api/users/serviceManagers`
      : `/api/users/technicians`;

    const requestBody = formatUpdateEmployeeAccountData(accountData);
    try {
      const {status} = await axiosClient.put(urlEndpoint, requestBody);

      if (status === 200) {
        enqueueSnackbar(
          `User account for ${accountData.firstName} updated successfully!`,
          {
            variant: 'success',
          },
        );
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        error.response?.message ||
          'Sorry! Unable to save changes right now. Please try again.',
        {
          variant: 'error',
        },
      );
    }
  };

  return {
    addEmployeeAccount,
    updateEmployeeAccount,
  };
};
