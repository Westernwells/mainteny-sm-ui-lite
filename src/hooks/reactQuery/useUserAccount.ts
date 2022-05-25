import {UserQueryParams} from 'models/employee';
import {Resource} from 'models/misc';
import {CommonUserView, Role, UserAccountView} from 'models/user';
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
  const response = await axiosClient.get<Resource<CommonUserView>>(
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

export const getUserAccount = async (username: string) => {
  const response = await axiosClient.get<UserAccountView>(
    `/api/users/${username}`,
  );
  return response.data;
};

export const useGetUserAccount = (username?: string) =>
  useQuery([qks.getUserAccount, username], () => getUserAccount(username!), {
    enabled: !!username,
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
