import {EmailObject, RestError} from 'models/misc';
import {useQuery, UseQueryOptions} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys} from 'reactQuery/constants';
import {useUserSession} from './useUserSession';

export const fetchCompanyEmailConfig = async (serviceCompanyId: string) => {
  const response = await axiosClient.get<EmailObject>(
    `/api/serviceCompanies/${serviceCompanyId}/email`,
    {
      params: {},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useFetchCompanyEmailConfig = (
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery<EmailObject, RestError>(
    [queryKeys.fetchCompanyEmailConfig, serviceCompanyId],
    () => fetchCompanyEmailConfig(serviceCompanyId!),
    {
      ...options,
      enabled: !!user,
    },
  );
};
