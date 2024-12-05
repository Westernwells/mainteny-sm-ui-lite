import {useSnackbar} from 'hooks/useSnackbar';
import {
  CreateElevatorDataSchemaBody,
  EditElevatorDataSchemaBody,
} from 'models/elevator';
import {StringValue} from 'models/misc';
import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient} from 'utils/axios-utils';

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
