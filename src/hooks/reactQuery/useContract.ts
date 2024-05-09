import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys as qk, queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  ContractRequestBody,
  ContractView,
  CreateContractComment,
  CustomerContractParams,
  ElevatorContractParams,
  QueryContractCommentsParams,
  QueryContractParams,
  UpdateContractComment,
} from 'models/contract';
import {Resource, RestError, StringValue, WithOptional} from 'models/misc';
import {useSnackbar} from 'hooks/useSnackbar';
import {Comment} from 'models/comment';
import {useUserSession} from './useUserSession';

export const queryContracts = async (params: QueryContractParams) => {
  const response = await axiosClient.get<Resource<ContractView>>(
    `/api/contracts`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useQueryContract = (
  params: WithOptional<QueryContractParams, 'serviceCompanyId'>,
  options?: UseQueryOptions<
    Resource<ContractView>,
    RestError,
    Resource<ContractView>
  >,
) => {
  const {user} = useUserSession();
  return useQuery<Resource<ContractView>, RestError, Resource<ContractView>>(
    [qk.contracts, params],
    () =>
      queryContracts({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {
      ...options,
    },
  );
};

export const fetchContractComments = async (
  contractId: string,
  params: QueryContractCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/contracts/${contractId}/comments`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const postContractComment = async (
  contractId: string,
  body: CreateContractComment,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    `/api/contracts/${contractId}/comments`,
    body,
  );
  return data;
};

export const deleteContractComment = async (
  contractId: string,
  noteId: string,
) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/contracts/${contractId}/comments/${noteId}`,
  );
  return data;
};

export const updateContractComment = async (
  contractId: string,
  noteId: string,
  body: UpdateContractComment,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/contracts/${contractId}/comments/${noteId}`,
    body,
  );
  return data;
};

const fetchContractDetails = async (contractId: string) => {
  const response = await axiosClient.get<ContractView>(
    `/api/contracts/${contractId}`,
  );
  return response.data;
};
export const useContractDetails = (contractId: string) =>
  useQuery([qk.contractDetails, contractId], () =>
    fetchContractDetails(contractId),
  );

export const queryCustomerContract = async (
  params: WithOptional<CustomerContractParams, 'serviceCompanyId'>,
  id: string,
) => {
  const response = await axiosClient.get<Resource<ContractView>>(
    `/api/propertyOwners/${id}/serviceCompanyContracts`,
    {params, paramsSerializer},
  );
  return response.data;
};

export const useUseQueryCustomerContracts = (
  params: WithOptional<CustomerContractParams, 'serviceCompanyId'>,
  id?: string,
  options?: any,
) => {
  const {user} = useUserSession();
  params = {
    ...params,
    serviceCompanyId: user?.userAccount.serviceCompany.id,
  };

  return useQuery(
    [queryKeys.queryCustomerContract, params, id],
    () => queryCustomerContract(params, id!),
    {
      enabled: !!id && !!user,
      ...options,
    },
  );
};

export const queryElevatorsContracts = async (
  params: ElevatorContractParams,
) => {
  const response = await axiosClient.get<{[key: string]: ContractView[]}>(
    '/api/elevators/contracts',
    {params, paramsSerializer},
  );
  return response.data;
};

export const useUseQueryElevatorsContracts = (
  params: ElevatorContractParams,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<{[key: string]: ContractView[]}>(
    [queryKeys.queryElevatorContracts, params],
    () => queryElevatorsContracts(params),
    {
      enabled: !!params.elevatorIds.length,
      ...options,
    },
  );

const UpdateContract = async (
  body: Partial<ContractRequestBody>,
  contractId: string,
) => {
  await axiosClient.put<StringValue>(`/api/contracts/${contractId}`, {
    ...body,
  });
};

export const useUpdateContract = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      contractId,
    }: {
      body: Partial<ContractRequestBody>;
      contractId: string;
    }) => UpdateContract(body, contractId),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(queryKeys.elevatorById);
        await queryClient.invalidateQueries(queryKeys.contractDetails);
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const createContract = async (
  body: ContractRequestBody,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/contracts', {
    ...body,
  });
  return response.data;
};

export const useCreateContract = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation((body: ContractRequestBody) => createContract(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      console.log(err);
      showError(err);
    },
  });
};

const deleteContract = async (contractId: string) => {
  const response = await axiosClient.delete<StringValue>(
    `/api/contracts/${contractId}`,
  );
  return response.data;
};

export const useDeleteContract = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation((contractId: string) => deleteContract(contractId), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(qk.contracts);
        queryClient.invalidateQueries(qk.queryCustomerContract);
      }
    },
    onError: (err: any) => {
      console.log(err);
      showError(err);
    },
  });
};

const attachElevatorsToContract = async (
  contractId: string,
  body: string[],
) => {
  await axiosClient.post<StringValue>(
    `/api/contracts/${contractId}/elevators`,
    body,
  );
};

export const useAttachElevatorsToContract = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({contractId, body}: {contractId: string; body: string[]}) =>
      attachElevatorsToContract(contractId, body),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.contractDetails);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export function useInfiniteContractComments(
  contractId: string,
  params: QueryContractCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [qk.fetchContractComments, params, contractId, {infinite: true}],
    ({pageParam = 0}) =>
      fetchContractComments(contractId, {...params, pageIndex: pageParam}),
    {
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
}

export const useCreateContractComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({contractId, body}: {contractId: string; body: CreateContractComment}) =>
      postContractComment(contractId, body),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([qk.fetchContractComments]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const useDeleteContractComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({contractId, noteId}: {contractId: string; noteId: string}) =>
      deleteContractComment(contractId, noteId),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([qk.fetchContractComments]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const useUpdateContractComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({
      contractId,
      noteId,
      body,
    }: {
      contractId: string;
      noteId: string;
      body: UpdateContractComment;
    }) => updateContractComment(contractId, noteId, body),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([qk.fetchContractComments]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};
