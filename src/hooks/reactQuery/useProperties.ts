import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {Resource, RestError} from 'models/misc';
import {useQuery, UseQueryOptions} from 'react-query';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {queryKeys} from 'reactQuery/constants';
import {PropertiesQuery} from 'models/valueProperty';

export const fetchProperties = async (
  {type, ...params}: PropertiesQuery,
  id: string,
) => {
  const response = await axiosClient.get<Resource<string>>(
    `/api/values/${type}`,
    {
      params: {
        ...params,
        serviceCompanyId: id,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useProperties(
  params: PropertiesQuery,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  return useQuery<Resource<string>, RestError>(
    [queryKeys.fetchProperties, params, serviceCompanyId],
    () => fetchProperties(params, user!.userAccount.serviceCompany.id),
    {
      ...options,
      enabled: !!user,
    },
  );
}
