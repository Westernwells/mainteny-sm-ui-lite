import {useQuery} from 'react-query';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const fetchDownloadUrl = async (
  filePath: string[],
  serviceCompanyId: string,
) => {
  const response = await axiosClient.get<{[key: string]: string}>(
    `/api/media/signedUrl/download`,
    {
      params: {file: filePath, serviceCompanyId},
      paramsSerializer,
    },
  );

  return response.data;
};

export const useDownloadUrl = (
  filePath: string[],
  options?: {[key: string]: any},
  companyId?: string,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  let fetchId = serviceCompanyId;

  if (companyId) {
    fetchId = companyId;
  }

  return useQuery(
    [qk.invoiceDownloadUrl, filePath, fetchId],
    () => fetchDownloadUrl(filePath, fetchId!),
    {
      enabled: !!filePath.length && !!fetchId,
      refetchInterval: 1000 * 300, // refetch signedURL after every 5 minutes
      refetchIntervalInBackground: true,
      cacheTime: 0,
      ...options,
    },
  );
};
