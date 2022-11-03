import {
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
  CustomerContractParams,
  ElevatorContractParams,
  QueryContractParams,
} from 'models/contract';
import {Resource, RestError, StringValue, WithOptional} from 'models/misc';
import {useSnackbar} from 'hooks/useSnackbar';
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
      enabled: !!user,
    },
  );
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
  const {enqueueSnackbar} = useSnackbar();
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
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.elevatorById);
        queryClient.invalidateQueries(queryKeys.contractDetails);
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

const createContract = async (
  body: ContractRequestBody,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/contracts', {
    ...body,
  });
  return response.data;
};

export const useCreateContract = (successMsg: string) => {
  const {enqueueSnackbar} = useSnackbar();
  return useMutation((body: ContractRequestBody) => createContract(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar('Some error occurred, please try again.', {
        variant: 'error',
      });
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
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation((contractId: string) => deleteContract(contractId), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(qk.contracts);
      }
    },
    onError: (err: any) => {
      console.log(err);
      enqueueSnackbar('An unexpected error occurred, please try again.', {
        variant: 'error',
      });
    },
  });
};
