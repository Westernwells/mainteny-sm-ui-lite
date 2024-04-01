import {
  CreateTravelWorkRecord,
  TravelWorkParams,
  TravelWorkView,
  UpdateTravalWorkRecord,
} from 'models/service-company';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {StringValue} from 'models/misc';
import {useUserSession} from './useUserSession';

export const fetchTravelWorks = async (
  serviceCompanyId: string,
  params: TravelWorkParams,
) => {
  const response = await axiosClient.get<TravelWorkView[]>(
    `/api/serviceCompanies/${serviceCompanyId}/travelWorks`,
    {
      params,
    },
  );
  return response.data;
};

export const useQueryTravelWorks = (
  params: TravelWorkParams,
  options?: any,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;
  return useQuery<TravelWorkView[], Error>(
    [queryKeys.queryTravelWorks, serviceCompanyId, params],
    () => fetchTravelWorks(serviceCompanyId, params),
    options,
  );
};

const createTravelWork = async (
  body: CreateTravelWorkRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(`/api/travelWorks`, {
    ...body,
  });
  return response.data;
};

export const useCreateTravelWork = (
  successMsg: string,
  onSuccessResponse?: (response: StringValue) => void,
) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation((body: CreateTravelWorkRecord) => createTravelWork(body), {
    onSuccess: (response) => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
      onSuccessResponse?.(response);
      queryClient.invalidateQueries(queryKeys.queryTravelWorks);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};

const updateTravelWork = async (
  id: string,
  body: UpdateTravalWorkRecord,
): Promise<StringValue> => {
  const response = await axiosClient.put<StringValue>(
    `/api/travelWorks/${id}`,
    {
      ...body,
    },
  );
  return response.data;
};

export const useUpdateTravelWork = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (body: UpdateTravalWorkRecord) => updateTravelWork(body.id, body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.queryTravelWorks);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const deleteTravelWork = async (id: string) => {
  await axiosClient.delete(`/api/travelWorks/${id}`);
};

export const useDeleteTravelWork = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(deleteTravelWork, {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
      queryClient.invalidateQueries(queryKeys.queryTravelWorks);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};
