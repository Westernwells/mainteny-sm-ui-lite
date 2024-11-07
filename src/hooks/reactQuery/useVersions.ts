import {useQuery} from 'react-query';
import {getVersionType, RestError} from 'models/misc';
import {GetVersionsParams, Version} from 'models/versions';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys} from 'reactQuery/constants';
import {useUserSession} from './useUserSession';

export const fetchVersions = async (params: GetVersionsParams) => {
  const response = await axiosClient.get<Version>(`/api/versions/latest`, {
    params,
    paramsSerializer,
  });
  return response.data;
};

export const useFetchLatestVersion = () => {
  const {hostname} = window.location;
  const type = getVersionType(hostname);
  const {user} = useUserSession();

  return useQuery<Version, RestError>(
    [queryKeys.fetchLatestVersion],
    () =>
      fetchVersions({
        type,
      }),
    {
      refetchInterval: 300000, // 5 minutes
      enabled: !!user && hostname !== 'localhost', // don't check for versions if we are running app locally or user is not logged in
    },
  );
};
