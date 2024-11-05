import {AxiosResponse} from 'axios';
import {NewServiceCompanyBody} from 'pages/NewCompany/model';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  Language,
  Resource,
  RestError,
  StringValue,
  WithOptional,
} from 'models/misc';
import {
  AutoNumberConfig,
  ServiceCompanyActivity,
  ServiceCompanyActivityParams,
  ServiceCompanyItem,
  ServiceCompanyNextNumberParams,
  ServiceCompanySummary,
  ServiceCompanySummaryParams,
  ServiceCompanySystemSettings,
  ServiceCompanyType,
  ServiceCompanyUpdateBody,
  StringValueResponse,
  SystemSettingsUpdateBody,
  XeroIntegration,
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
import {ServiceOrder, ServiceOrderTypeRecord} from 'models/service-order';
import {ContractPaymentTermView, ContractTermView} from 'models/contract';
import {useSnackbar} from 'hooks/useSnackbar';
import {
  EmployeeEventTypeRecord,
  SaveEmployeeEventTypeRecords,
} from 'models/employee';
import {useUserSession} from './useUserSession';
import {Page} from '../../models/pagination';

export const getCompanies = async (
  page: Page,
  query: string,
  status?: string,
) => {
  const response = await axiosClient.get<Resource<ServiceCompanyItem>>(
    '/api/serviceCompanies',
    {
      params: {
        query,
        ...(status && {status}),
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
  status?: string,
) {
  return useQuery<Resource<ServiceCompanyItem>, RestError>(
    [queryKeys.fetchCompanies, page, query, status],
    () => getCompanies(page, query, status),
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

export const useCompanyById = (
  companyId?: string,
  shouldFetch?: boolean,
  options?: {refetchOnWindowFocus?: boolean; useErrorBoundary?: boolean},
) => {
  const {showError} = useSnackbar();

  return useQuery(
    [queryKeys.fetchCompany, companyId],
    () => getCompany(companyId!),
    {
      enabled:
        shouldFetch !== undefined ? !!companyId && shouldFetch : !!companyId,
      onError: (err: any) => {
        showError(err);
      },
      ...(options ?? {}),
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
            serviceCompany: {
              ...user!.userAccount.serviceCompany,
              ...company,
              language:
                (localStorage.getItem('i18nextLng') as Language) ||
                company.language,
            },
          },
        });
        queryClient.invalidateQueries(queryKeys.fetchCompany);
      },
      onError: (err: any) => {
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
        showError(err);
      },
    },
  );
};

const updateAutoNumberConfig = async (
  body: AutoNumberConfig,
  companyId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/serviceCompanies/${companyId}/settings/autoNumber`,
    {
      ...body,
    },
  );
};

export const useUpdateAutoNumberConfig = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, companyId}: {body: AutoNumberConfig; companyId: string}) =>
      updateAutoNumberConfig(body, companyId),
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      onSuccess: async (__, {companyId}) => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchAutoNumberConfig);
      },
      onError: (err: any) => {
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
  shouldFetch?: boolean,
) =>
  useQuery(
    [queryKeys.fetchcompanyNextNumber, companyId, params.type],
    () => getCompanyNextNumber(params, companyId!),
    {
      enabled:
        shouldFetch !== undefined ? !!companyId && shouldFetch : !!companyId,
    },
  );

export const getCompanyXeroInfo = async (companyId: string) => {
  const response = await axiosClient.get<XeroIntegration>(
    `/api/serviceCompanies/${companyId}/settings/xero`,
  );
  return response.data;
};

export const useCompanyXeroInfo = (companyId?: string) => {
  const {showError} = useSnackbar();
  return useQuery(
    [queryKeys.fetchXeroIntegration, companyId],
    () => getCompanyXeroInfo(companyId!),
    {
      enabled: !!companyId,
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

export const queryContractTerms = async (
  serviceCompanyId: string,
  page: Page,
  query: string,
  type: ServiceCompanyType,
) => {
  const response = await axiosClient.get<Resource<ContractTermView>>(
    `/api/serviceCompanies/${serviceCompanyId}/terms`,
    {
      params: {
        query,
        type,
        ...page,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export const useContractTerms = ({
  page,
  query,
  type,
  options,
}: {
  page: Page;
  query: string;
  type: ServiceCompanyType;
  options?: UseQueryOptions<any, any, any>;
}) => {
  const {user} = useUserSession();
  return useQuery<Resource<ContractTermView>, RestError>(
    [queryKeys.queryContractTerms, page, query],
    () =>
      queryContractTerms(
        user!.userAccount.serviceCompany.id,
        page,
        query,
        type,
      ),
    {
      enabled: !!user,
      ...options,
    },
  );
};

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

const updateServiceCompanySystemSettings = async (
  body: ServiceCompanySystemSettings,
  companyId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/serviceCompanies/${companyId}/systemSettings`,
    {
      ...body,
    },
  );
};

export const useUpdateServiceCompanySystemSettings = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      body,
      companyId,
    }: {
      body: ServiceCompanySystemSettings;
      companyId: string;
    }) => updateServiceCompanySystemSettings(body, companyId),
    {
      onSuccess: async () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchCompanies);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

export const getCompanyEventTypes = async (companyId: string) => {
  const response = await axiosClient.get<EmployeeEventTypeRecord[]>(
    `/api/serviceCompanies/${companyId}/eventTypes`,
  );
  return response.data;
};

export const useGetCompanyEventTypes = (
  companyId: string,
  shouldFetch?: boolean,
  options?: {refetchOnWindowFocus?: boolean; useErrorBoundary?: boolean},
) => {
  const {showError} = useSnackbar();

  return useQuery(
    [queryKeys.fetchCompanyEventTypes, companyId],
    () => getCompanyEventTypes(companyId!),
    {
      enabled:
        shouldFetch !== undefined ? !!companyId && shouldFetch : !!companyId,
      onError: (err) => {
        showError(err);
      },
      ...(options ?? {}),
    },
  );
};

export const updateCompanyEventTypes = async (
  companyId: string,
  body: SaveEmployeeEventTypeRecords,
) => {
  const response = await axiosClient.put<StringValue>(
    `/api/serviceCompanies/${companyId}/eventTypes`,
    body,
  );
  return response.data;
};

export const useUpdateCompanyEventTypes = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      body,
      companyId,
    }: {
      body: SaveEmployeeEventTypeRecords;
      companyId: string;
    }) => updateCompanyEventTypes(companyId, body),
    {
      onSuccess: async () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchCompanyEventTypes);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const fetchCompanyJobTypes = async (companyId: string) => {
  const response = await axiosClient.get<ServiceOrderTypeRecord[]>(
    `/api/serviceCompanies/${companyId}/serviceOrderTypes`,
  );
  return response.data;
};

export const useCompanyJobTypes = (
  companyId: string,
  shouldFetch?: boolean,
  options?: {refetchOnWindowFocus?: boolean; useErrorBoundary?: boolean},
) => {
  const {showError} = useSnackbar();

  return useQuery(
    [queryKeys.fetchCompanyJobTypes, companyId],
    () => fetchCompanyJobTypes(companyId!),
    {
      enabled:
        shouldFetch !== undefined ? !!companyId && shouldFetch : !!companyId,
      onError: (err) => {
        showError(err);
      },
      ...(options ?? {}),
    },
  );
};

export const fetchOldCompanyJobTypes = async (companyId: string) => {
  const response = await axiosClient.get<ServiceOrderTypeRecord[]>(
    `/api/serviceCompanies/${companyId}/serviceOrderTypes/old`,
  );
  return response.data;
};

export const useOldCompanyJobTypes = (
  companyId: string,
  shouldFetch?: boolean,
  options?: {refetchOnWindowFocus?: boolean; useErrorBoundary?: boolean},
) => {
  const {showError} = useSnackbar();

  return useQuery(
    [queryKeys.fetchOldCompanyJobTypes, companyId],
    () => fetchOldCompanyJobTypes(companyId!),
    {
      enabled:
        shouldFetch !== undefined ? !!companyId && shouldFetch : !!companyId,
      onError: (err) => {
        showError(err);
      },
      ...(options ?? {}),
    },
  );
};

export const updateCompanyServiceOrderTypes = async (
  companyId: string,
  body: {
    serviceOrderTypes: ServiceOrderTypeRecord[];
  },
) => {
  const response = await axiosClient.put<ServiceOrderTypeRecord[]>(
    `/api/serviceCompanies/${companyId}/serviceOrderTypes`,
    body,
  );
  return response.data;
};

export const useUpdateCompanyJobTypes = () => {
  const {showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<
    ServiceOrderTypeRecord[],
    unknown,
    {body: ServiceOrderTypeRecord[]; companyId: string}
  >(
    ({body, companyId}) =>
      updateCompanyServiceOrderTypes(companyId, {serviceOrderTypes: body}),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries(queryKeys.fetchCompanyJobTypes);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};
