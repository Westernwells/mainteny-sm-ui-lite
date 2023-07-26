import {AxiosResponse} from 'axios';
import {NewServiceCompanyBody} from 'pages/NewCompany/model';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  Page,
  Resource,
  RestError,
  StringValue,
  WithOptional,
} from 'models/misc';
import {
  ServiceCompanyActivity,
  ServiceCompanyActivityParams,
  AutoNumberConfig,
  ServiceCompanyItem,
  StringValueResponse,
  ServiceCompanyNextNumberParams,
  ServiceCompanySummary,
  ServiceCompanySummaryParams,
  ServiceCompanyUpdateBody,
  SystemSettingsUpdateBody,
} from 'models/service-company';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {ServiceOrder} from 'models/service-order';
import {ContractPaymentTermView} from 'models/contract';
import {useSnackbar} from 'hooks/useSnackbar';
import {useUserSession} from './useUserSession';

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

export const useCompanyById = (companyId?: string) => {
  const {showError} = useSnackbar();
  return useQuery(
    [queryKeys.fetchCompany, companyId],
    () => getCompany(companyId!),
    {
      enabled: !!companyId,
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const updateCompany = async (
  body: ServiceCompanyUpdateBody,
  companyId: string,
) => {
  await axiosClient.put<StringValue>(`/api/serviceCompanies/${companyId}`, {
    ...body,
  });
};

export const useUpdateCompany = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user, updateUser} = useUserSession();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, companyId}: {body: ServiceCompanyUpdateBody; companyId: string}) =>
      updateCompany(body, companyId),
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: async (__, {companyId}) => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        const company = await getCompany(companyId);
        updateUser({
          ...user!,
          userAccount: {
            ...user!.userAccount,
            serviceCompany: {...user!.userAccount.serviceCompany, ...company},
          },
        });
        queryClient.invalidateQueries(queryKeys.fetchCompany);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
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
  const {enqueueSnackbar, showError} = useSnackbar();
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
        showError(err);
      },
    },
  );
};

const createServiceCompany = async (
  body: NewServiceCompanyBody,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('api/serviceCompanies', {
    ...body,
  });
  return response.data;
};

export const useCreateServiceCompany = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (body: NewServiceCompanyBody) => createServiceCompany(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const getCompanyActivities = async (params: ServiceCompanyActivityParams) => {
  const response: AxiosResponse<Resource<ServiceCompanyActivity<'string'>>> =
    await axiosClient.get(
      `/api/serviceCompanies/${params.serviceCompanyId}/activities`,
      {
        params,
        paramsSerializer,
      },
    );
  // json parse is needed because of the way the API returns the data (JSON string)
  return {
    ...response.data,
    data: response.data.data.map((activity) => ({
      ...activity,
      data: JSON.parse(activity.data),
    })),
  };
};

export const useServiceCompanyActivities = (
  params: WithOptional<ServiceCompanyActivityParams, 'serviceCompanyId'>,
  options?: UseInfiniteQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  return useInfiniteQuery<
    Resource<ServiceCompanyActivity<ServiceOrder>>,
    RestError,
    Resource<ServiceCompanyActivity<ServiceOrder>>
  >(
    [queryKeys.serviceCompanyActivity, params],
    ({pageParam = 0}) =>
      getCompanyActivities({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        pageIndex: pageParam,
      }),
    {
      enabled: !!user,
      getNextPageParam: (lastPage) => {
        const currentTotal =
          (lastPage.page.pageIndex + 1) * lastPage.page.pageSize;
        if (lastPage.total && currentTotal < lastPage.total) {
          return lastPage.page.pageIndex + 1;
        }
        return undefined;
      },
      ...options,
    },
  );
};

export const getCompanySummary = async (
  params: Partial<ServiceCompanySummaryParams>,
  companyId: string,
) => {
  const response = await axiosClient.get<ServiceCompanySummary>(
    `/api/serviceCompanies/${companyId}/summary`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useCompanySummary = (
  params: Partial<ServiceCompanySummaryParams>,
  companyId?: string,
) =>
  useQuery(
    [queryKeys.fetchCompanySummary, companyId, params.timeUnit],
    () => getCompanySummary(params, companyId!),
    {
      enabled: !!companyId,
    },
  );

export const queryContractPaymentTerms = async (
  serviceCompanyId: string,
  page: Page,
  query: string,
) => {
  const response = await axiosClient.get<Resource<ContractPaymentTermView>>(
    `/api/serviceCompanies/${serviceCompanyId}/contractPaymentTerms`,
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

export const useQueryContractPaymentTerms = ({
  page,
  query,
  options,
}: {
  page: Page;
  query: string;
  options?: UseQueryOptions<any, any, any>;
}) => {
  const {user} = useUserSession();
  return useQuery<Resource<ContractPaymentTermView>, RestError>(
    [queryKeys.queryContractPaymentTerms, page, query],
    () =>
      queryContractPaymentTerms(
        user!.userAccount.serviceCompany.id,
        page,
        query,
      ),
    {
      enabled: !!user,
      ...options,
    },
  );
};

export const getCompanyAutoNumberConfig = async (companyId: string) => {
  const response = await axiosClient.get<AutoNumberConfig>(
    `/api/serviceCompanies/${companyId}/settings/autoNumber`,
  );
  return response.data;
};

export const useCompanyAutoNumberConfig = (companyId?: string) => {
  const {showError} = useSnackbar();
  return useQuery(
    [queryKeys.fetchAutoNumberConfig, companyId],
    () => getCompanyAutoNumberConfig(companyId!),
    {
      enabled: !!companyId,
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const getCompanyNextNumber = async (
  params: Partial<ServiceCompanyNextNumberParams>,
  companyId?: string,
) => {
  const response: AxiosResponse<StringValueResponse> = await axiosClient.get(
    `/api/serviceCompanies/${companyId}/nextNumber`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useCompanyNextNumber = (
  params: Partial<ServiceCompanyNextNumberParams>,
  companyId?: string,
) =>
  useQuery(
    [queryKeys.fetchcompanyNextNumber, companyId, params.type],
    () => getCompanyNextNumber(params, companyId!),
    {
      enabled: !!companyId,
    },
  );
