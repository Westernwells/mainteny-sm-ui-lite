import {useSnackbar} from 'hooks/useSnackbar';
import {
  CreateElevatorDataSchemaBody,
  EditElevatorDataSchemaBody,
  GetElevatorDataSchemasAffectedFieldParams,
} from 'models/elevator';
import {RestError, StringValue} from 'models/misc';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';

const createElevatorDataSchemas = async (
  body: CreateElevatorDataSchemaBody,
) => {
  await axiosClient.post<StringValue>(`/api/elevatorDataSchemas`, {
    ...body,
  });
};

export const useCreateElevatorDataSchemas = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body}: {body: CreateElevatorDataSchemaBody}) =>
      createElevatorDataSchemas(body),
    {
      onSuccess: async () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchElevatorDataSchemas);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const editElevatorDataSchemas = async (
  schemaId: string,
  body: EditElevatorDataSchemaBody,
) => {
  await axiosClient.put<StringValue>(`/api/elevatorDataSchemas/${schemaId}`, {
    ...body,
  });
};

export const useEditElevatorDataSchemas = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({schemaId, body}: {schemaId: string; body: EditElevatorDataSchemaBody}) =>
      editElevatorDataSchemas(schemaId, body),
    {
      onSuccess: async () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchElevatorDataSchemas);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const deleteElevatorDataSchemas = async (schemaId: string) => {
  await axiosClient.delete<StringValue>(`/api/elevatorDataSchemas/${schemaId}`);
};

export const useDeleteElevatorDataSchemas = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({schemaId}: {schemaId: string}) => deleteElevatorDataSchemas(schemaId),
    {
      onSuccess: async () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchElevatorDataSchemas);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const getElevatorDataSchemasAffectedFields = async (
  schemaId: string,
  query: GetElevatorDataSchemasAffectedFieldParams,
) => {
  const response = await axiosClient.get<{[key: string]: number}>(
    `/api/elevatorDataSchemas/${schemaId}/affectedFields`,
    {
      params: query,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useGetElevatorDataSchemasAffectedFields = (
  schemaId?: string,
  params?: GetElevatorDataSchemasAffectedFieldParams,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    useErrorBoundary?: boolean;
  },
) =>
  useQuery<{[key: string]: number}, RestError>(
    [
      queryKeys.getElevatorDataSchemasAffectedFields,
      schemaId,
      params?.fieldNames,
    ],
    () => getElevatorDataSchemasAffectedFields(schemaId!, params!),
    {
      ...options,
      enabled: options?.enabled && !!schemaId,
    },
  );
