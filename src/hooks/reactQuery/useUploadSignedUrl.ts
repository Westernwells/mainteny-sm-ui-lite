import {useSnackbar} from 'hooks/useSnackbar';
import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {FileWithPreview} from 'models/files';
import {useUserSession} from './useUserSession';

const getArrayBuffer = (file: FileWithPreview | File) =>
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
  file: FileWithPreview | File,
  serviceCompanyId: string,
  uploadPath: string,
  fullPathWithName?: string,
) => {
  try {
    const filePath = fullPathWithName ?? `${uploadPath}/${file.name}`;
    const [signedUrl, arrayBuffer] = await Promise.all([
      getUploadSignedUrl([filePath], serviceCompanyId),
      getArrayBuffer(file) as unknown as ArrayBuffer,
    ]);

    if (!signedUrl[filePath]) {
      throw new Error('Signed URL is undefined or invalid');
    }

    const response = await fetch(signedUrl[filePath], {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const uploadImages = async (
  files: FileWithPreview[] | File[],
  serviceCompanyId: string,
  uploadPath: string,
  useNameAsFullPath?: boolean, // when upload path already has name
) =>
  Promise.all(
    files.map((item) =>
      uploadAndSave(
        item,
        serviceCompanyId!,
        uploadPath,
        useNameAsFullPath ? uploadPath : undefined,
      ),
    ),
  );

export const useUploadFiles = (successMsg?: string, companyId?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user} = useUserSession();
  const queryClient = useQueryClient();
  let fetchId = user?.userAccount.serviceCompany.id;
  if (companyId) {
    fetchId = companyId;
  }

  return useMutation(
    ({
      files,
      uploadPath,
      useNameAsFullPath = false,
    }: {
      files: FileWithPreview[] | File[];
      uploadPath: string;
      useNameAsFullPath?: boolean;
    }) => uploadImages(files, fetchId!, uploadPath, useNameAsFullPath),
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
        showError(err);
      },
    },
  );
};
