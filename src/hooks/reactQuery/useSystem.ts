import {StringValue} from 'models/misc';
import {RebuildFormModel} from 'pages/SystemSettings/models';
import {useMutation} from 'react-query';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';

const rebuildIndex = async (data: RebuildFormModel): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    'api/system/index',
    null,
    {params: data},
  );
  return response.data;
};

export const useRebuildIndex = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation((data: RebuildFormModel) => rebuildIndex(data), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const createIndex = async (type: string): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    `api/system/esIndices/${type}`,
  );
  return response.data;
};

export const useCreateIndex = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation((type: string) => createIndex(type), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};
