import {AxiosResponse} from 'axios';
import {ServiceManager} from 'models/serviceManager';
import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

const fetchServiceManager = async (username: string) => {
  // TODO: This is a temporary solution,
  const response: AxiosResponse<ServiceManager> = await axiosClient({
    method: 'GET',
    url: `/api/sessions/runAs/${username}`,
  });
  return response.data;
};
export const useServiceManager = () => {
  const {user} = useUserSession();
  return useQuery(
    [queryKeys.serviceManager, user?.userAccount.username],
    () => fetchServiceManager(user!.userAccount.username),
    {
      enabled: !!user,
    },
  );
};
