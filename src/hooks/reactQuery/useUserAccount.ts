import {useQuery, useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import {queryKeys as qks} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';

import {
  CreateEmployeeAccountData,
  EmployeeAccountData as EditEmployeeAccountData,
  UserQueryParams,
} from 'models/employee';
import {Resource, WithOptional} from 'models/misc';
import {UserView} from 'models/user';
import {
  formatCreateEmployeeAccountData,
  formatUpdateEmployeeAccountData,
} from 'utils/account-utils';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const queryUserAccounts = async (params: UserQueryParams) => {
  const response = await axiosClient.get<Resource<UserView>>(
    `/api/serviceCompanies/${params.serviceCompanyId}/users`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useQueryUserAccounts = (
  params: WithOptional<UserQueryParams, 'serviceCompanyId'>,
  options?: any,
  companyId?: string,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery(
    [qks.queryUserAccounts, params],
    () =>
      queryUserAccounts({
        ...params,
        serviceCompanyId: companyId || serviceCompanyId!,
      }),
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

export const useGetUserAccount = (
  id?: string,
  options?: {enabled?: boolean; refetchOnWindowFocus?: boolean},
) =>
  useQuery([qks.getUserAccount, id], () => getUserAccount(id!), {
    enabled: !!id,
    ...(options ?? {}),
  });

export const useEmployeeAccount = () => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  const {t} = useTranslation();

  const addEmployeeAccount = async (
    accountData: CreateEmployeeAccountData,
    onSuccess?: () => void,
  ): Promise<void> => {
    const requestBody = formatCreateEmployeeAccountData(accountData);

    try {
      const {status} = await axiosClient.post(
        'api/users/employees',
        requestBody,
      );

      if (status === 200) {
        enqueueSnackbar(
          t('User account for {{name}} created successfully.', {
            name: accountData.firstName,
          }),
          {
            variant: 'success',
          },
        );
        if (onSuccess) {
          queryClient.invalidateQueries(qks.queryUserAccounts);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  const updateEmployeeAccount = async (
    accountData: EditEmployeeAccountData,
    employeeId: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    const requestBody = formatUpdateEmployeeAccountData(accountData);
    try {
      const {status} = await axiosClient.put(
        `/api/users/employees/${employeeId}`,
        requestBody,
      );

      if (status === 200) {
        enqueueSnackbar(
          t('User account for {{name}} updated successfully.', {
            name: accountData.firstName,
          }),
          {
            variant: 'success',
          },
        );
        if (onSuccess) {
          queryClient.invalidateQueries(qks.getUserAccount);
          queryClient.invalidateQueries(qks.queryUserAccounts);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  const updateUserPassword = async (
    password: string,
    username: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    try {
      const {status} = await axiosClient.put(
        `/api/users/${username}/newPassword`,
        {
          password,
        },
      );

      if (status === 200) {
        if (onSuccess) {
          queryClient.invalidateQueries(qks.getUserAccount);
          queryClient.invalidateQueries(qks.queryUserAccounts);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  return {
    addEmployeeAccount,
    updateEmployeeAccount,
    updateUserPassword,
  };
};
