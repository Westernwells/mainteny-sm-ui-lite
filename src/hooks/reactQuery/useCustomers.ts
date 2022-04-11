import {Resource, RestError, WithOptional} from 'models/misc';
import {PropertyOwner, QueryPropertyOwnersParams} from 'models/propertyManager';
import {useCallback} from 'react';
import {useQuery, UseQueryOptions} from 'react-query';
import {queryKeys as qks, queryKeys} from 'reactQuery/constants';
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

export const useFetchCustomerElevatorNumbers = (
  customers: PropertyOwner[],
  options?: UseQueryOptions<
    {
      [key: string]: number;
    },
    RestError,
    PropertyOwner[]
  >,
) => {
  const propertyOwnerIds = customers.map((customer) => customer.id);

  return useQuery<{[key: string]: number}, RestError, PropertyOwner[]>(
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
      ...options,
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
  options?: any,
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
      ...options,
      enabled: !!user,
    },
  );
};

export const getCustomer = async (id: string) => {
  const response = await axiosClient.get<PropertyOwner>(
    `/api/propertyOwners/${id}`,
  );
  return response.data;
};

export const useGetCustomer = (id?: string) =>
  useQuery([queryKeys.getCustomer, id], () => getCustomer(id!), {
    enabled: !!id,
  });
