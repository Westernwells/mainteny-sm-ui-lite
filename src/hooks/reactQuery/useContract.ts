import {useCallback} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import * as _ from 'lodash';
import {queryKeys as qk, queryKeys} from 'reactQuery/constants';
import {useNavigate} from 'react-router';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  ContractFilters,
  ContractRequestBody,
  ContractView,
  CustomerContractParams,
  ElevatorContractParams,
  QueryContractParams,
} from 'models/contract';
import {Resource, RestError, StringValue, WithOptional} from 'models/misc';
import {useSnackbar} from 'notistack';
import {
  addDays,
  endOfDay,
  isWithinInterval,
  startOfDay,
  subDays,
} from 'date-fns';
import {toDate} from 'utils/datetime';
import {useUserSession} from './useUserSession';

const filterByExpiryData = (
  contractsRes: Resource<ContractView>,
  expiryDate: string[],
) => {
  let mergedResult = [] as ContractView[];
  let start: Date;
  let end: Date;

  let contractMap = {} as {[key: string]: ContractView[]};
  // TODO: Find a better solution to this
  expiryDate.forEach((item) => {
    switch (item) {
      case 'Last 14 days': // TODO: create an enum
        start = startOfDay(subDays(new Date(), 14));
        end = endOfDay(new Date());
        break;
      case 'Today':
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case 'Next 7 days':
        start = startOfDay(new Date());
        end = endOfDay(addDays(new Date(), 7));
        break;
      case 'Next 14 days':
        start = startOfDay(new Date());
        end = endOfDay(addDays(new Date(), 14));
        break;
      default:
        break;
    }

    contractsRes.data.forEach((contract) => {
      if (isWithinInterval(toDate(contract.endTime), {start, end})) {
        contractMap = {
          ...contractMap,
          [item]: contractMap[item]
            ? [...contractMap[item], contract]
            : [contract],
        };
      }
    });
  });

  expiryDate
    .map((item) => contractMap[item])
    .filter((item) => item)
    .forEach((item) => {
      const diff = _.differenceBy(mergedResult, item, 'id');
      mergedResult = [...diff, ...item];
    });

  return mergedResult;
};

export const filterByContractor = (
  contractsRes: Resource<ContractView>,
  contractors: string[],
) => {
  let mergedResult = [] as ContractView[];
  const contractsByContractor = _.groupBy(
    contractsRes.data,
    (contract) => contract.serviceCompany.name,
  );

  contractors
    .map((contractor) => contractsByContractor[contractor])
    .filter((item) => item)
    .forEach((item) => {
      const diff = _.differenceBy(mergedResult, item, 'id');
      mergedResult = [...diff, ...item];
    });

  return mergedResult;
};

export const filterByPrice = (
  contractsRes: Resource<ContractView>,
  price: number[][],
) => {
  let mergedResult = [] as ContractView[];

  const inRange = (item: number, range: number[][]) => {
    let result = false;
    range.forEach((interval) => {
      if (item >= interval[0] && item < interval[1]) {
        result = true;
      }
    });
    return result;
  };
  mergedResult = contractsRes.data.filter((item) => inRange(item.price, price));
  return mergedResult;
};

const filterContracts = (
  contractsRes: Resource<ContractView>,
  filter: ContractFilters,
) => {
  let result = {...contractsRes};
  if (filter.expiryDate?.length) {
    const expiryDates = filterByExpiryData(contractsRes, filter.expiryDate);
    result = {...result, data: expiryDates, total: expiryDates.length};
  }

  if (filter.price?.length) {
    const prices = filterByPrice(result, filter.price);
    result = {...result, data: prices, total: prices.length};
  }
  return result;
};

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
  // TODO: Write 'interface' for filter object
  filter: ContractFilters,
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
      select: useCallback(
        (contractsRes: Resource<ContractView>) => {
          const filterResult = filterContracts(contractsRes, filter);
          return filterResult;
        },
        [filter],
      ),
    },
  );
};

const fetchContractDetails = async (contractId: string) => {
  const response = await axiosClient.get<ContractView>(
    `/api/contracts/${contractId}`,
  );
  return response.data;
};
export const useContractDetails = (contractId: string) => {
  const navigate = useNavigate();
  return useQuery(
    [qk.contractDetails, contractId],
    () => fetchContractDetails(contractId),
    {
      onError: (e: any) => {
        if (e.response.status === 500) navigate('/404');
      },
    },
  );
};

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
  filter?: ContractFilters | null,
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
      select: useCallback(
        (contractsRes: Resource<ContractView>) => {
          if (filter) {
            const filterResult = filterContracts(contractsRes, filter);
            return filterResult;
          }
          return contractsRes;
        },
        [filter],
      ),
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
      },
      onError: (err: any) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};
