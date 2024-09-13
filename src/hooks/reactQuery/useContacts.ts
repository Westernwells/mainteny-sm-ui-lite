import {
  ContactBody,
  ContactPersonAssociationQueryParams,
  ContactPersonAssociationView,
  ContactsView,
  CreateContactPersonAssociationRecord,
  CreatePropertyContactPersonRecord,
  RefContactPersonQueryParams,
  RefContactPersonView,
  ServiceCompanyContactPeronFormModel,
  ServiceCompanyContactPersonQueryParams,
  ServiceCompanyContactPersonView,
  UpdatePropertyContactPersonRecord,
} from 'models/contacts';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
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
import {Resource, RestError, StringValue} from 'models/misc';
import {Comment, CommentRecord} from 'models/comment';
import {AxiosError} from 'axios';
import {useUserSession} from './useUserSession';
import {Page} from '../../models/pagination';

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

export function usePropertyOwnerContacts(
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

const deletePropertyOwnerContactPerson = async ({
  propertyOwnerId,
  propertyContactPersonId,
}: {
  propertyOwnerId: string;
  propertyContactPersonId: string;
}) => {
  await axiosClient.delete<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}/contactPersons/${propertyContactPersonId}`,
  );
};
export const useDeletePropertyOwnerContactPerson = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      propertyOwnerId,
      propertyContactPersonId,
    }: {
      propertyOwnerId: string;
      propertyContactPersonId: string;
    }) =>
      deletePropertyOwnerContactPerson({
        propertyOwnerId,
        propertyContactPersonId,
      }),
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

const inviteContact = async (
  propertyContactPersonId: string,
  username: string,
) => {
  await axiosClient.post<StringValue>(
    `/api/users/propertyContactPersons/${propertyContactPersonId}/invitation`,
    undefined,
    {params: {username}, paramsSerializer},
  );
};

export const useInviteContact = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      propertyContactPersonId,
      username,
    }: {
      propertyContactPersonId: string;
      username: string;
    }) => inviteContact(propertyContactPersonId, username),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContacts);
      },
      onError: (err: AxiosError<RestError>) => {
        console.error(err);
        const ALREADY_EXISTS_CODE = 1004;
        const INVALID_USER_ACCOUNT_CODE = 3047;
        if (err.response?.data?.message) {
          enqueueSnackbar(
            err.response.data?.errorCode === ALREADY_EXISTS_CODE
              ? 'This Email address is already used for a different customer portal'
              : err.response.data?.errorCode === INVALID_USER_ACCOUNT_CODE
              ? 'Invalid user account status'
              : 'Invalid email address',
            {
              variant: 'error',
            },
          );
        } else {
          showError(err);
        }
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

export const fetchServiceCompanyContactPersons = async (
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
  const response = await axiosClient.post<StringValue>(`/api/contactPersons`, {
    ...body,
  });

  return response.data;
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
        queryClient.invalidateQueries([queryKeys.queryContacts]);
        queryClient.invalidateQueries([queryKeys.queryRefContactPersons]);
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

const queryContactPersonNotes = async (
  params: Partial<Page>,
  contactPersonId: string,
) => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/contactPersons/${contactPersonId}/notes`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useInfiniteContactPersonNotes = (
  contactPersonId: string,
  params: Page,
  options?: UseInfiniteQueryOptions<any, any, any>,
) =>
  useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [
      queryKeys.queryContactPersonNotes,
      contactPersonId,
      params,
      {infinite: true},
    ],
    ({pageParam = 0}) =>
      queryContactPersonNotes(
        {...params, pageIndex: pageParam},
        contactPersonId,
      ),
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

const addContactPersonNote = async (
  body: Partial<CommentRecord>,
  contactPersonId: string,
) => {
  await axiosClient.post<StringValue>(
    `/api/contactPersons/${contactPersonId}/notes`,
    {
      ...body,
    },
  );
};

export const useAddContactPersonNote = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({body, contactPersonId}: {body: CommentRecord; contactPersonId: string}) =>
      addContactPersonNote(body, contactPersonId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContactPersonNotes);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const updateContactPersonNote = async (
  body: Partial<CommentRecord>,
  contactPersonId: string,
  noteId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/contactPersons/${contactPersonId}/notes/${noteId}`,
    {
      ...body,
    },
  );
};

export const useUpdateContactPersonNote = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      contactPersonId,
      noteId,
    }: {
      body: CommentRecord;
      contactPersonId: string;
      noteId: string;
    }) => updateContactPersonNote(body, contactPersonId, noteId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContactPersonNotes);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const deleteContactPersonNote = async (
  contactPersonId: string,
  noteId: string,
) => {
  await axiosClient.delete<StringValue>(
    `/api/contactPersons/${contactPersonId}/notes/${noteId}`,
  );
};

export const useDeleteContactPersonNote = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({contactPersonId, noteId}: {contactPersonId: string; noteId: string}) =>
      deleteContactPersonNote(contactPersonId, noteId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContactPersonNotes);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const fetchContactPersonAssociations = async (
  contactPersonId: string,
  params: Partial<ContactPersonAssociationQueryParams>,
) => {
  const response = await axiosClient.get<
    Resource<ContactPersonAssociationView>
  >(`/api/contactPersons/${contactPersonId}/associations`, {
    params,
    paramsSerializer,
  });
  return response.data;
};

export const useContactPersonAssociations = (
  contactPersonId: string,
  params: Partial<ContactPersonAssociationQueryParams>,
) =>
  useInfiniteQuery(
    [
      queryKeys.fetchContactPersonAssociations,
      contactPersonId,
      params,
      {infinite: true},
    ],
    ({pageParam = 0}) =>
      fetchContactPersonAssociations(contactPersonId, {
        ...params,
        pageIndex: pageParam,
      }),
    {
      getNextPageParam: (lastPage) => {
        const currentTotal =
          (lastPage.page.pageIndex + 1) * lastPage.page.pageSize;
        if (lastPage.total && currentTotal < lastPage.total) {
          return lastPage.page.pageIndex + 1;
        }
        return undefined;
      },
    },
  );

const disconnectContactPersonAssociation = async (
  contactPersonId: string,
  associationId: string,
) => {
  await axiosClient.delete<StringValue>(
    `/api/contactPersons/${contactPersonId}/associations/${associationId}`,
  );
};

export const useDisconnectContactPersonAssociation = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      contactPersonId,
      associationId,
    }: {
      contactPersonId: string;
      associationId: string;
    }) => disconnectContactPersonAssociation(contactPersonId, associationId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchContactPersonAssociations);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const addContactPersonAssociation = async (
  body: CreateContactPersonAssociationRecord,
  contactPersonId: string,
) => {
  await axiosClient.post<StringValue>(
    `/api/contactPersons/${contactPersonId}/associations`,
    {
      ...body,
    },
  );
};

export const useAddContactPersonAssociation = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      contactPersonId,
    }: {
      body: CreateContactPersonAssociationRecord;
      contactPersonId: string;
    }) => addContactPersonAssociation(body, contactPersonId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchContactPersonAssociations);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const queryRefContactPersons = async (params: RefContactPersonQueryParams) => {
  const response = await axiosClient.get<Resource<RefContactPersonView>>(
    '/api/contactPersons/references',
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useRefContactPersons = (params: RefContactPersonQueryParams) =>
  useQuery([queryKeys.queryRefContactPersons, params.refId], () =>
    queryRefContactPersons(params),
  );

const createPropertyOwnerContactPerson = async (
  propertyOwnerId: string,
  body: CreatePropertyContactPersonRecord,
) => {
  await axiosClient.post<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}/contactPersons`,
    {
      ...body,
    },
  );
};
export const useCreatePropertyContactPerson = (
  propertyOwnerId: string,
  successMsg?: string,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    (body: CreatePropertyContactPersonRecord) =>
      createPropertyOwnerContactPerson(propertyOwnerId, body),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryRefContactPersons);
        queryClient.invalidateQueries(queryKeys.queryContacts);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const updatePropertyOwnerContactPerson = async (
  propertyOwnerId: string,
  propertyContactPersonId: string,
  body: UpdatePropertyContactPersonRecord,
) => {
  await axiosClient.put<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}/contactPersons/${propertyContactPersonId}`,
    {
      ...body,
    },
  );
};
export const useUpdatePropertyContactPerson = (
  propertyOwnerId: string,
  successMsg?: string,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      propertyContactPersonId,
      body,
    }: {
      propertyContactPersonId: string;
      body: UpdatePropertyContactPersonRecord;
    }) =>
      updatePropertyOwnerContactPerson(
        propertyOwnerId,
        propertyContactPersonId,
        body,
      ),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryRefContactPersons);
        queryClient.invalidateQueries(queryKeys.queryContacts);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};
