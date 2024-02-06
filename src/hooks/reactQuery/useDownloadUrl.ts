import {UseQueryResult, useQuery} from 'react-query';
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
): UseQueryResult<{[key: string]: string}> => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  let fetchId = serviceCompanyId;

  if (companyId) {
    fetchId = companyId;
  }

  const fetchBatchDownloadUrls = async (batch: string[]) =>
    fetchDownloadUrl(batch, fetchId!);

  const batchSize = 5;
  const batches = Array.from(
    {length: Math.ceil(filePath.length / batchSize)},
    (_, index) => {
      const start = index * batchSize;
      const end = start + batchSize;
      return filePath.slice(start, end);
    },
  );

  const promises = batches.map((batch) => fetchBatchDownloadUrls(batch));

  return useQuery(
    [qk.invoiceDownloadUrl, filePath, fetchId],
    () =>
      Promise.all(promises).then((results) => Object.assign({}, ...results)),
    {
      enabled: !!filePath.length && !!fetchId,
      cacheTime: 0,
      ...options,
    },
  );
};
