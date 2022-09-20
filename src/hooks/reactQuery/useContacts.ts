import {ContactsView, ContactBody} from 'models/contacts';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {ErrorCode} from 'models/error';
import {Page, Resource, RestError, StringValue} from '../../models/misc';

export const getContacts = async (page: Page, customerId: string) => {
  const response = await axiosClient.get<Resource<ContactsView>>(
    `api/propertyOwners/${customerId}/contactPersons`,
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
  const {enqueueSnackbar} = useSnackbar();
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

const createContact = async (body: ContactBody) => {
  await axiosClient.post<StringValue>(`/api/users/propertyContactPersons`, {
    ...body,
  });
};

export const useCreateContact = (successMsg?: string) => {
  const {enqueueSnackbar} = useSnackbar();
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
      if (
        (err?.response?.data as RestError)?.errorCode ===
        ErrorCode.USERNAME_EXISTS
      ) {
        enqueueSnackbar('A contact person with this email already exists.', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
      }
    },
  });
};

const deleteContact = async (contactId: string) => {
  await axiosClient.delete<StringValue>(
    `/api/users/propertyContactPersons/${contactId}`,
  );
};

export const useDeleteContact = (successMsg?: string) => {
  const {enqueueSnackbar} = useSnackbar();
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
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
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
  const {enqueueSnackbar} = useSnackbar();
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
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};
