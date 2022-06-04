import {useQuery} from 'react-query';
// import * as _ from 'lodash';
import {useCallback} from 'react';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const fetchDownloadUrl = async (
  pdfPath: string[],
  serviceCompanyId: string,
) => {
  const response = await axiosClient.get<{[key: string]: string}>(
    `/api/media/signedUrl/download`,
    {
      params: {file: pdfPath, serviceCompanyId},
      paramsSerializer,
    },
  );

  return response.data;
};

export const useDownloadUrl = (
  pdfPath: string[],
  options?: {[key: string]: any},
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery(
    [qk.invoiceDownloadUrl, pdfPath, serviceCompanyId],
    () => fetchDownloadUrl(pdfPath, serviceCompanyId!),
    {
      enabled: !!pdfPath.length && !!serviceCompanyId,
      refetchOnWindowFocus: false,
      cacheTime: 0,
      ...options,
      select: useCallback(
        (data) => pdfPath?.map((item) => data[item]),
        [pdfPath],
      ),
    },
  );
};
