import {
  ContactsView,
  ContactBody,
  ServiceCompanyContactPersonQueryParams,
  ServiceCompanyContactPersonView,
  ServiceCompanyContactPeronFormModel,
} from 'models/contacts';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  ContractElevatorQueryParams,
  ContractElevatorUpdate,
  ContractElevatorView,
} from 'models/contract';
import {Page, Resource, RestError, StringValue} from 'models/misc';
import {useUserSession} from './useUserSession';

const fetchContractElevators = async (
  contractId: string,
  params: Partial<ContractElevatorQueryParams>,
): Promise<Resource<ContractElevatorView>> => {
  const response = await axiosClient.get<Resource<ContractElevatorView>>(
    `/api/contracts/${contractId}/elevators`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const getContacts = async (page: Page, customerId: string) => {
  const response = await axiosClient.get<Resource<ContactsView>>(
    `/api/propertyOwners/${customerId}/contactPersons`,
    {
      params: {
        query: '',
        ...page,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useContacts(
  page: Page,
  customerId: string,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<Resource<ContactsView>, RestError>(
    [queryKeys.queryContacts, page, customerId],
    () => getContacts(page, customerId),
    {
      ...options,
    },
  );
}

const updateContact = async (body: ContactBody, contactId: string) => {
  await axiosClient.put<StringValue>(
    `/api/users/propertyContactPersons/${contactId}`,
    {
      ...body,
    },
  );
};

export const useUpdateContact = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, contactId}: {body: ContactBody; contactId: string}) =>
      updateContact(body, contactId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContacts);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const createContact = async (body: ContactBody) => {
  await axiosClient.post<StringValue>(`/api/users/propertyContactPersons`, {
    ...body,
  });
};

export const useCreateContact = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(({body}: {body: ContactBody}) => createContact(body), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.queryContacts);
    },
    onError: (err: any) => {
      console.log(err);
      showError(err);
    },
  });
};

const deleteContact = async (contactId: string) => {
  await axiosClient.delete<StringValue>(
    `/api/users/propertyContactPersons/${contactId}`,
  );
};

export const useDeleteContact = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({contactId}: {contactId: string}) => deleteContact(contactId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContacts);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const inviteContact = async (userName: string) => {
  await axiosClient.post<StringValue>(
    `/api/users/propertyContactPersons/${userName}/invitation`,
  );
};

export const useInviteContact = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({userName}: {userName: string}) => inviteContact(userName),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContacts);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const useContractElevators = (
  contractId: string,
  params: Partial<ContractElevatorQueryParams>,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<Resource<ContractElevatorView>, RestError>(
    [queryKeys.fetchContractElevators, contractId, params],
    () => fetchContractElevators(contractId, params),
    {...options},
  );

const updateContractElevator = async (
  body: ContractElevatorUpdate,
  contractId: string,
  elevatorId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/contracts/${contractId}/elevators/${elevatorId}`,
    {
      ...body,
    },
  );
};

export const useUpdateContractElevator = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      elevatorId,
      contractId,
    }: {
      body: ContractElevatorUpdate;
      elevatorId: string;
      contractId: string;
    }) => updateContractElevator(body, contractId, elevatorId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.fetchContractElevators);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const fetchServiceCompanyContactPersons = async (
  serviceCompanyId: string,
  params: Partial<ServiceCompanyContactPersonQueryParams>,
) => {
  const response = await axiosClient.get<
    Resource<ServiceCompanyContactPersonView>
  >(`/api/serviceCompanies/${serviceCompanyId}/contactPersons`, {
    params,
    paramsSerializer,
  });
  return response.data;
};

export const useServiceCompanyContactPersons = (
  params: Partial<ServiceCompanyContactPersonQueryParams>,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery<Resource<ServiceCompanyContactPersonView>, RestError>(
    [queryKeys.queryServiceCompanyContactPersons, serviceCompanyId, params],
    () => fetchServiceCompanyContactPersons(serviceCompanyId!, params),
    {
      ...options,
      enabled: !!user,
    },
  );
};

const createServiceCompanyContactPerson = async (
  body: ServiceCompanyContactPeronFormModel,
) => {
  await axiosClient.post<StringValue>(`/api/contactPersons`, {
    ...body,
  });
};

export const useCreateServiceCompanyContactPerson = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    (data: ServiceCompanyContactPeronFormModel) =>
      createServiceCompanyContactPerson(data),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries([
          queryKeys.queryServiceCompanyContactPersons,
        ]);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const updateServiceCompanyContactPerson = async (
  body: ServiceCompanyContactPeronFormModel,
  contactPersonId: string,
) => {
  await axiosClient.put<StringValue>(`/api/contactPersons/${contactPersonId}`, {
    ...body,
  });
};

export const useUpdateServiceCompanyContactPerson = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      contactPersonId,
    }: {
      body: ServiceCompanyContactPeronFormModel;
      contactPersonId: string;
    }) => updateServiceCompanyContactPerson(body, contactPersonId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries([
          queryKeys.queryServiceCompanyContactPersons,
        ]);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const deleteServiceCompanyContactPerson = async (contactPersonId: string) => {
  await axiosClient.delete<StringValue>(
    `/api/contactPersons/${contactPersonId}`,
  );
};

export const useDeleteServiceCompanyContactPerson = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    (contactPersonId: string) =>
      deleteServiceCompanyContactPerson(contactPersonId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries([
          queryKeys.queryServiceCompanyContactPersons,
        ]);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};
