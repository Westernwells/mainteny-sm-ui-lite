import {FileWithPreview} from 'components/MyDropzone';
import {useSnackbar} from 'notistack';
import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

// interface SignedUrl {
//   [key: string]: string;
// }

const getArrayBuffer = (file: FileWithPreview) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const getUploadSignedUrl = async (
  filePath: string[],
  serviceCompanyId: string,
) => {
  const response = await axiosClient.get<{[key: string]: string}>(
    `/api/media/signedUrl/upload`,
    {
      params: {file: filePath, serviceCompanyId},
      paramsSerializer,
    },
  );
  return response.data;
};

const uploadAndSave = async (
  file: FileWithPreview,
  serviceCompanyId: string,
) => {
  const [signedUrl, arrayBuffer] = await Promise.all([
    getUploadSignedUrl([file.name], serviceCompanyId),
    getArrayBuffer(file) as unknown as ArrayBuffer,
  ]);

  await fetch(signedUrl[file.name], {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: arrayBuffer,
  });

  // console.log(signedUrl, arrayBuffer, '***********');
};

export const uploadImages = async (
  files: FileWithPreview[],
  serviceCompanyId: string,
) => Promise.all(files.map((item) => uploadAndSave(item, serviceCompanyId!)));

export const useUploadImages = (successMsg: string) => {
  const {enqueueSnackbar} = useSnackbar();
  const {user} = useUserSession();
  const queryClient = useQueryClient();
  return useMutation(
    (files: FileWithPreview[]) =>
      uploadImages(files, user?.userAccount.serviceCompany.id!),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.elevatorById);
      },
      onError: (err: any) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};
