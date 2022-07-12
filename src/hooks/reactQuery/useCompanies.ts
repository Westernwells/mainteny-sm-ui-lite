import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {Page, Resource, RestError, StringValue} from 'models/misc';
import {
  ServiceCompanyItem,
  ServiceCompanyUpdateBody,
  SystemSettingsUpdateBody,
} from 'models/service-company';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {useSnackbar} from 'notistack';

export const getCompanies = async (page: Page, query: string) => {
  const response = await axiosClient.get<Resource<ServiceCompanyItem>>(
    '/api/serviceCompanies',
    {
      params: {
        query,
        ...page,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useCompanies(
  page: Page,
  query: string,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<Resource<ServiceCompanyItem>, RestError>(
    [queryKeys.fetchCompanies, page, query],
    () => getCompanies(page, query),
    {
      ...options,
    },
  );
}

export const getCompany = async (companyId: string) => {
  const response = await axiosClient.get<ServiceCompanyItem>(
    `/api/serviceCompanies/${companyId}`,
  );
  return response.data;
};

export const useCompanyById = (companyId?: string) =>
  useQuery([queryKeys.fetchCompany, companyId], () => getCompany(companyId!), {
    enabled: !!companyId,
  });

const updateCompany = async (
  body: ServiceCompanyUpdateBody,
  companyId: string,
) => {
  await axiosClient.put<StringValue>(`/api/serviceCompanies/${companyId}`, {
    ...body,
  });
};

export const useUpdateCompany = (successMsg?: string) => {
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, companyId}: {body: ServiceCompanyUpdateBody; companyId: string}) =>
      updateCompany(body, companyId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchCompany);
      },
      onError: (err: any) => {
        console.log(err);
        enqueueSnackbar(
          'Sorry! Unable to save changes right now. Please try again.',
          {
            variant: 'error',
          },
        );
      },
    },
  );
};

const updateSystemSettings = async (
  body: SystemSettingsUpdateBody,
  companyId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/serviceCompanies/${companyId}/systemSettings`,
    {
      ...body,
    },
  );
};

export const useUpdateSystemSettings = (successMsg?: string) => {
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, companyId}: {body: SystemSettingsUpdateBody; companyId: string}) =>
      updateSystemSettings(body, companyId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchCompany);
      },
      onError: (err: any) => {
        console.log(err);
        enqueueSnackbar(
          'Sorry! Unable to save changes right now. Please try again.',
          {
            variant: 'error',
          },
        );
      },
    },
  );
};
