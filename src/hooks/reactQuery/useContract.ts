import {useCallback} from 'react';
import {useQuery} from 'react-query';
import {queryKeys as qk} from 'reactQuery/constants';
// FIXME: Dummy Import
import {staticContractDetails} from 'pages/ContractDetails/data';
import {
  staticContracts,
  staticContractElevatorCount,
} from 'pages/Contracts/data';
import {ContractView, QueryContractParams} from 'models/contract';
import {Resource, RestError} from 'models/misc';
import {useServiceManager} from './useServiceManager';

export const fetchContractElevatorCount = async (contractId: string[]) => {
  // TODO: make API call to fetch Contracts
  console.log(contractId);

  // const response = await axiosClient.get<{[key: string]: number}>(
  //   `/api/contracts/elevators/count`,
  //   {
  //     params: {contractId},
  //     paramsSerializer,
  //   },
  // );
  return Promise.resolve(staticContractElevatorCount);
};

export const fetchContracts = async (
  id: string,
  params: QueryContractParams,
) => {
  // TODO: make API call to fetch Contracts
  console.log(id, params);
  // const response = await axiosClient.get<Resource<ContractView>>(
  //   `/api/propertyOwners/${id}/contracts`,
  //   {
  //     params,
  //     paramsSerializer,
  //   },
  // );

  return Promise.resolve(staticContracts);
};

const filterContracts = (contractsRes: Resource<ContractView>, filter: {}) => {
  const result = {...contractsRes};
  console.log(filter);
  // TODO: Filter code goes here
  return result;
};

export const useQueryContract = (
  params: QueryContractParams,
  // TODO: Write 'interface' for filter object
  filter: {},
) => {
  const {data: user} = useServiceManager();
  return useQuery<Resource<ContractView>, RestError, Resource<ContractView>>(
    [qk.contracts, params],
    () => fetchContracts(user!.serviceManager.id, params),
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
  // TODO: make API call to fetch Contract Details
  console.log(contractId);
  // const response = await axiosClient.get<ContractView>(
  //   `/api/contracts/${contractId}`,
  // );
  return Promise.resolve(staticContractDetails);
};
export const useContractDetails = (contractId: string) =>
  useQuery([qk.contractDetails, contractId], () =>
    fetchContractDetails(contractId),
  );
