import {useCallback} from 'react';
import {useQuery} from 'react-query';
import * as _ from 'lodash';
import {queryKeys as qk} from 'reactQuery/constants';
// FIXME: Dummy Import
import {staticContractDetails} from 'pages/ContractDetails/data';
import {staticContracts} from 'pages/Contracts/data';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {ContractView, QueryContractParams} from 'models/contract';
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

const filterContracts = (contractsRes: Resource<ContractView>, filter: {}) => {
  const result = {...contractsRes};
  // TODO: Filter code goes here
  return result;
};

export const useQueryContract = (
  params: WithOptional<QueryContractParams, 'serviceCompanyId'>,
  // TODO: Write 'interface' for filter object
  filter: {},
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
