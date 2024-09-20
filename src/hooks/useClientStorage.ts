import {ClientDataRecord} from 'models/client-storage';
import {RestError, StringValue} from 'models/misc';
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from './useSnackbar';

export const fetchClientStorageData = async (
  serviceCompanyId: string,
  params?: {key?: string},
) => {
  const response = await axiosClient.get<ClientDataRecord>(
    `/api/serviceCompanies/${serviceCompanyId}/clientStorage`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryClientStorageData = ({
  serviceCompanyId,
  params,
  options,
}: {
  serviceCompanyId: string;
  params?: {key: string};
  options?: UseQueryOptions<any, any, any>;
}) =>
  useQuery<ClientDataRecord, RestError>(
    [queryKeys.fetchClientStorageData, serviceCompanyId],
    () => fetchClientStorageData(serviceCompanyId, params),
    {
      ...options,
      enabled: !!serviceCompanyId,
    },
  );

const updateServiceCompanyClientStorage = async (
  body: ClientDataRecord,
  serviceCompanyId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/serviceCompanies/${serviceCompanyId}/clientStorage`,
    {
      ...body,
    },
  );
};

export const useUpdateServiceCompanyClientStorage = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      serviceCompanyId,
    }: {
      body: ClientDataRecord;
      serviceCompanyId: string;
    }) => updateServiceCompanyClientStorage(body, serviceCompanyId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries([queryKeys.fetchClientStorageData]);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const deleteClientStorageData = async ({
  serviceCompanyId,
  params,
}: {
  serviceCompanyId: string;
  params: {key: string};
}) => {
  await axiosClient.delete<StringValue>(
    `/api/serviceCompanies/${serviceCompanyId}/clientStorage`,
    {
      params,
      paramsSerializer,
    },
  );
};

export const useDeleteClientStorageData = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(deleteClientStorageData, {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.fetchClientStorageData);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};
