import {useCallback} from 'react';
import {useQuery} from 'react-query';
// import * as _ from 'lodash';
import {queryKeys as qk} from 'reactQuery/constants';
// FIXME: Dummy Import
import {staticContracts} from 'pages/Contracts/data';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  ContractFilters,
  ContractView,
  QueryContractParams,
} from 'models/contract';
import {Resource, RestError, WithOptional} from 'models/misc';
import {useUserSession} from './useUserSession';

export const fetchContractElevatorCount = async (contractId: string[]) => {
  const response = await axiosClient.get<{[key: string]: number}>(
    `/api/contracts/elevators/count`,
    {
      params: {contractId},
      paramsSerializer,
    },
  );
  return response.data;
};

export const fetchContracts = async (
  id: string,
  params: QueryContractParams,
) => {
  const response = await axiosClient.get<Resource<ContractView>>(
    `/api/contracts`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

Promise.resolve(staticContracts);

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
  if (filter.price.length) {
    if (filter.price.length) {
      const prices = filterByPrice(result, filter.price);
      result = {...result, data: prices, total: prices.length};
    }
  }
  return result;
};

export const useQueryContract = (
  params: WithOptional<QueryContractParams, 'serviceCompanyId'>,
  // TODO: Write 'interface' for filter object
  filter: ContractFilters,
) => {
  const {user} = useUserSession();
  return useQuery<Resource<ContractView>, RestError, Resource<ContractView>>(
    [qk.contracts, params],
    () =>
      fetchContracts(user!.userAccount.id, {
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {
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

export const useContractElevatorCount = (contracts: ContractView[]) => {
  const contractIds = contracts.map((contract) => contract.id);
  return useQuery(
    [qk.fetchContractElevatorCount, contractIds],
    () => fetchContractElevatorCount(contractIds),
    {
      enabled: !!contracts.length,
      select: useCallback(
        (data) =>
          contracts.map((contract) => ({
            ...contract,
            units: data[contract.id],
          })),

        [contracts],
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
export const useContractDetails = (contractId: string) =>
  useQuery([qk.contractDetails, contractId], () =>
    fetchContractDetails(contractId),
  );
