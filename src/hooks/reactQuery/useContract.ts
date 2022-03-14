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

export const fetchContractElevatorCount = async (
  contractId: string[], // eslint-disable-line
) =>
  // TODO: make API call to fetch Contracts

  // const response = await axiosClient.get<{[key: string]: number}>(
  //   `/api/contracts/elevators/count`,
  //   {
  //     params: {contractId},
  //     paramsSerializer,
  //   },
  // );

  Promise.resolve(staticContractElevatorCount);

export const fetchContracts = async (
  id: string, // eslint-disable-line
  params: QueryContractParams, // eslint-disable-line
) =>
  // TODO: make API call to fetch Contracts

  // const response = await axiosClient.get<Resource<ContractView>>(
  //   `/api/propertyOwners/${id}/contracts`,
  //   {
  //     params,
  //     paramsSerializer,
  //   },
  // );

  Promise.resolve(staticContracts);
/* eslint-disable no-unused-vars */
const filterContracts = (contractsRes: Resource<ContractView>, filter: {}) => {
  /* eslint-enable no-unused-vars */
  const result = {...contractsRes};
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

const fetchContractDetails = async (
  contractId: string, // eslint-disable-line
) =>
  // TODO: make API call to fetch Contract Details

  // const response = await axiosClient.get<ContractView>(
  //   `/api/contracts/${contractId}`,
  // );
  Promise.resolve(staticContractDetails);
export const useContractDetails = (contractId: string) =>
  useQuery([qk.contractDetails, contractId], () =>
    fetchContractDetails(contractId),
  );
