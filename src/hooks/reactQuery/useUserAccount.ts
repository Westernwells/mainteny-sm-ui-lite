import {EmployeeQueryParams} from 'models/employee';
import {Resource} from 'models/misc';
import {UserAccountView} from 'models/user';
import {useQuery} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const queryUserAccouts = async (
  params: EmployeeQueryParams,
  serviceCompanyId: string,
) => {
  const response = await axiosClient.get<Resource<UserAccountView>>(
    `/api/serviceCompanies/${serviceCompanyId}/users`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useQueryUserAccounts = (
  params: EmployeeQueryParams,
  options?: any,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery(
    [qks.queryUserAccounts, params],
    () => queryUserAccouts(params, serviceCompanyId!),
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
