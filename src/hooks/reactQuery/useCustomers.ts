import {Resource, WithOptional} from 'models/misc';
import {PropertyOwner, QueryPropertyOwnersParams} from 'models/propertyManager';
import {useCallback} from 'react';
import {useQuery} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const fetchCustomerElevatorNumbers = async (
  propertyOwnerIds: string[],
) => {
  const response = await axiosClient.get<{[key: string]: number}>(
    `/api/propertyOwners/elevatorNumbers`,
    {
      params: {propertyOwnerIds},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryCustomertElevatorNumbers = (
  customers: PropertyOwner[],
) => {
  const propertyOwnerIds = customers.map((customer) => customer.id);
  // console.log(propertyOwnerIds, '~~~~~~~~~~~~~')

  return useQuery(
    [qks.fetchCustomerElevatorNumbers, propertyOwnerIds],
    () => fetchCustomerElevatorNumbers(propertyOwnerIds),
    {
      enabled: !!propertyOwnerIds.length,
      select: useCallback(
        (data) =>
          customers.map((customer) => ({
            ...customer,
            units: data[customer.id],
          })),

        [customers],
      ),
    },
  );
};

export const queryCustomers = async (params: QueryPropertyOwnersParams) => {
  const response = await axiosClient.get<Resource<PropertyOwner>>(
    '/api/propertyOwners',
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryCustomers = (
  params: WithOptional<QueryPropertyOwnersParams, 'serviceCompanyId'>,
) => {
  const {user} = useUserSession();

  return useQuery(
    [qks.queryCustomers, params],
    () =>
      queryCustomers({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {
      enabled: !!user,
    },
  );
};
