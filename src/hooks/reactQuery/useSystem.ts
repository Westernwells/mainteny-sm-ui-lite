import {RestError, StringValue} from 'models/misc';
import {RebuildFormModel} from 'pages/SystemSettings/models';
import {useMutation, useQuery} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {queryKeys} from 'reactQuery/constants';
import {SystemSettingRecord} from 'models/system';

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

export const fetchSystemSettings = async () => {
  const response = await axiosClient.get<SystemSettingRecord>(
    `/api/system/settings`,
    {
      paramsSerializer,
    },
  );
  return response.data;
};

export const useFetchSystemSettings = () =>
  useQuery<SystemSettingRecord, RestError>([queryKeys.fetchLatestVersion], () =>
    fetchSystemSettings(),
  );
