import {useMutation, useQuery, useQueryClient} from 'react-query';

import {AbsenceItem} from 'models/absence';
import {Resource, RestError, StringValue} from 'models/misc';
import {AbsenceForm} from 'pages/EmployeeDetails/Absence/model';
import {queryKeys} from 'reactQuery/constants';
import {formatCreateAbsence} from 'utils/absence-utils';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {AbsenceUpdate} from '../../pages/EmployeeDetails/Absence/model';

export const getAbsence = async (params: any, employeeId: string) => {
  const response = await axiosClient.get<Resource<AbsenceItem>>(
    `/api/technicians/${employeeId}/events`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useGetAbsence = (params: any, employeeId: string | null) =>
  useQuery<Resource<AbsenceItem>, RestError>(
    [queryKeys.fetchAbsence, params, employeeId],
    () => getAbsence(params, employeeId!),
    {
      enabled: !!employeeId,
    },
  );

export const useAbsence = () => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  const createAbsence = async (
    data: AbsenceForm,
    employeeId: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    const requestBody = formatCreateAbsence(data, employeeId);

    try {
      const {status} = await axiosClient.post(
        '/api/technicianEvents',
        requestBody,
      );

      if (status === 200) {
        enqueueSnackbar(`Absence created successfully!`, {
          variant: 'success',
        });
        if (onSuccess) {
          queryClient.invalidateQueries(queryKeys.getUserAccount);
          queryClient.invalidateQueries(queryKeys.fetchAbsence);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  return {
    createAbsence,
  };
};

const deleteAbsence = async (eventId: string) => {
  await axiosClient.delete<StringValue>(`/api/technicianEvents/${eventId}`);
};

export const useDeleteAbsence = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(({eventId}: {eventId: string}) => deleteAbsence(eventId), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.getUserAccount);
      queryClient.invalidateQueries(queryKeys.fetchAbsence);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};

const updateAbsence = async (body: AbsenceUpdate, eventId: string) => {
  await axiosClient.put<StringValue>(`/api/technicianEvents/${eventId}`, {
    ...body,
  });
};

export const useUpdateAbsence = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, eventId}: {body: AbsenceUpdate; eventId: string}) =>
      updateAbsence(body, eventId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.getUserAccount);
        queryClient.invalidateQueries(queryKeys.fetchAbsence);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};
