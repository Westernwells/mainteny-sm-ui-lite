import {useCallback} from 'react';
import {UseQueryResult, useQuery} from 'react-query';
import heic2any from 'heic2any';
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

  const fetchBatchDownloadUrls = async (batch: string[]) => {
    const downloadUrls = await fetchDownloadUrl(batch, fetchId!);

    const conversionPromises = Object.keys(downloadUrls).map(async (file) => {
      const extension = file.split('.').pop()?.toLowerCase();
      if (extension === 'heic') {
        try {
          const res = await fetch(downloadUrls[file]);
          const blob = await res.blob();
          const conversionResult = await heic2any({
            blob,
            toType: 'image/jpeg',
          });

          const url = URL.createObjectURL(
            Array.isArray(conversionResult)
              ? new Blob(conversionResult, {type: 'image/jpeg'})
              : conversionResult,
          );
          downloadUrls[file] = url;
        } catch (error) {
          console.error(error);
        }
      }
    });

    await Promise.all(conversionPromises);

    return downloadUrls;
  };

  const batchSize = 5;
  const batches = Array.from(
    {length: Math.ceil(filePath.length / batchSize)},
    (_, index) => {
      const start = index * batchSize;
      const end = start + batchSize;
      return filePath.slice(start, end);
    },
  );

  return useQuery(
    [qk.invoiceDownloadUrl, filePath, fetchId],
    () => {
      const promises = batches.map((batch) => fetchBatchDownloadUrls(batch));
      return Promise.all(promises).then((results) =>
        Object.assign({}, ...results),
      );
    },
    {
      enabled: !!filePath.length && !!fetchId,
      cacheTime: 0,
      ...options,
    },
  );
};

/**
 * `useDownloadFileWithCustomName` is a hook for downloading a file with a custom name.
 *
 * @param {string} fileName - The file name.
 * @param {string} downloadUrl - The URL to download the file from.
 * @param {string} [extension='pdf'] - The file extension (default is 'pdf').
 *
 * @returns {Function} A function that downloads the file and names it as `{fileName}_{YYMMDD}.{extension}`.
 */
export const useDownloadFileWithCustomName = (
  fileName: string | undefined | number,
  downloadUrl: string,
  extension?: 'pdf',
) => {
  const fileExtension = extension || 'pdf';
  let finalFileName = fileName || 'Unassigned';
  const downloadFile = useCallback(
    async (downloadURLArg?: string) => {
      try {
        const response = await fetch(downloadURLArg || downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set the file name
        const date = new Date();
        const formattedDate = `${date.getFullYear().toString().substr(-2)}${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        finalFileName = fileName
          ? `${fileName}_${formattedDate}.${fileExtension}`
          : `Unassigned_${formattedDate}.${fileExtension}`;
        link.download = finalFileName;

        link.target = '_blank';
        link.click();
      } catch (error) {
        console.error('Failed to download file:', error);
      }
    },
    [fileName, downloadUrl],
  );

  return {downloadFile, fileName: finalFileName};
};
