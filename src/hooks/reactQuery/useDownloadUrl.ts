import {useCallback} from 'react';
import {UseQueryOptions, UseQueryResult, useQuery} from 'react-query';
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

export const fetchDownloadUrls = async (
  batch: string[],
  serviceCompanyId: string,
) => {
  const downloadUrls = await fetchDownloadUrl(batch, serviceCompanyId);

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

export const useDownloadUrl = (
  filePath: string[],
  options?: UseQueryOptions<{[key: string]: string}>,
  companyId?: string,
): UseQueryResult<{[key: string]: string}> => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  let fetchId = serviceCompanyId;

  if (companyId) {
    fetchId = companyId;
  }

  const batchSize = 5;
  const batches = Array.from(
    {length: Math.ceil(filePath.length / batchSize)},
    (_, index) => {
      const start = index * batchSize;
      const end = start + batchSize;
      return filePath.slice(start, end);
    },
  );

  return useQuery<{[key: string]: string}>(
    [qk.invoiceDownloadUrl, filePath, fetchId],
    () => {
      if (!filePath.length) {
        return Promise.resolve({});
      }

      const promises = batches.map((batch) =>
        fetchDownloadUrls(batch, fetchId!),
      );
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
    async (
      downloadURLArg?: string,
      options?: {fileNameArg?: string; extensionArg?: string},
    ) => {
      try {
        const {fileNameArg, extensionArg} = options ?? {};
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

        const ext = extensionArg || fileExtension;

        if (fileNameArg) {
          finalFileName = `${fileNameArg}_${formattedDate}.${ext}`;
        } else {
          finalFileName = fileName
            ? `${fileName}_${formattedDate}.${ext}`
            : `Unassigned_${formattedDate}.${ext}`;
        }
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
