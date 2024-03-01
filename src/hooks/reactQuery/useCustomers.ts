import {useTranslation} from 'react-i18next';
import {
  Page,
  Resource,
  RestError,
  StringValue,
  WithOptional,
} from 'models/misc';
import {
  PropertyOwnerView,
  QueryPropertyOwnersParams,
} from 'models/propertyManager';
import {useSnackbar} from 'hooks/useSnackbar';
import {CustomerEditForm} from 'pages/CustomerDetails/Tabs/CustomerOverview/EditCustomerForm/model';
import {NewCustomerBody} from 'pages/NewCustomer/model';
import {
  UseInfiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {queryKeys as qks, queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {formatUpdateCustomer} from 'utils/customer-utils';
import {CreateCustomerNote} from 'models/customer';
import {Comment} from 'models/comment';
import {useUserSession} from './useUserSession';

export const queryCustomers = async (params: QueryPropertyOwnersParams) => {
  const response = await axiosClient.get<Resource<PropertyOwnerView>>(
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
      enabled: !!user,
      ...options,
    },
  );
};

export const getCustomer = async (id: string) => {
  const response = await axiosClient.get<PropertyOwnerView>(
    `/api/propertyOwners/${id}`,
  );
  return response.data;
};

export const useGetCustomer = (id?: string) =>
  useQuery([queryKeys.getCustomer, id], () => getCustomer(id!), {
    enabled: !!id,
  });

export const fetchCustomerNotes = async (id: string, params: Page) => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/propertyOwners/${id}/notes`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export function useInfiniteCustomerNotes(
  id: string,
  params: Page,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [queryKeys.fetchCustomerNotes, params, id, {infinite: true}],
    ({pageParam = 0}) =>
      fetchCustomerNotes(id, {...params, pageIndex: pageParam}),
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
}

export const postCustomerNote = async (
  id: string,
  body: CreateCustomerNote,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    `/api/propertyOwners/${id}/notes`,
    body,
  );
  return data;
};

export const useCreateCustomerNote = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, body}: {id: string; body: CreateCustomerNote}) =>
      postCustomerNote(id, body),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([queryKeys.fetchCustomerNotes]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const deleteCustomerNote = async (id: string, noteId: string) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/propertyOwners/${id}/notes/${noteId}`,
  );
  return data;
};

export const useDeleteCustomerNote = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, noteId}: {id: string; noteId: string}) =>
      deleteCustomerNote(id, noteId),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([queryKeys.fetchCustomerNotes]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const updateCustomerNote = async (
  id: string,
  noteId: string,
  body: CreateCustomerNote,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/propertyOwners/${id}/notes/${noteId}`,
    body,
  );
  return data;
};

export const useUpdateCustomerNote = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({
      id,
      noteId,
      body,
    }: {
      id: string;
      noteId: string;
      body: CreateCustomerNote;
    }) => updateCustomerNote(id, noteId, body),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([queryKeys.fetchCustomerNotes]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const createCustomer = async (body: NewCustomerBody): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('api/propertyOwners', {
    ...body,
  });
  return response.data;
};

export const useCreateCustomer = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation((body: NewCustomerBody) => createCustomer(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
      queryClient.invalidateQueries(queryKeys.queryCustomers, {
        refetchInactive: true,
      });
    },
    onError: (err) => {
      console.log(err);
      showError(err);
    },
  });
};

export const useCustomer = () => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  const {t} = useTranslation();
  let isLoading = false;

  const updateCustomer = async (
    data: CustomerEditForm,
    propertyOwnerId: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    const requestBody = formatUpdateCustomer(data);
    try {
      isLoading = true;
      const {status} = await axiosClient.put(
        `/api/propertyOwners/${propertyOwnerId}`,
        requestBody,
      );

      if (status === 200) {
        enqueueSnackbar(
          t('Customer {{customerName}} updated successfully!', {
            customerName: data.name,
          }),
          {
            variant: 'success',
          },
        );
        if (onSuccess) {
          queryClient.invalidateQueries(queryKeys.getCustomer);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error(error);
      showError(error);
    } finally {
      queryClient.invalidateQueries(queryKeys.queryCustomers);
      isLoading = false;
    }
  };

  return {
    updateCustomer,
    isLoading,
  };
};

const deleteCustomer = async (propertyOwnerId: string) => {
  const response = await axiosClient.delete<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}`,
  );
  return response.data;
};

export const useDeleteCustomer = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    (propertyOwnerId: string) => deleteCustomer(propertyOwnerId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryCustomers);
      },
      onError: (err: any) => {
        console.log(
          '🚀 ~ file: useCustomers.ts ~ useDeleteCustomer ~ err',
          err,
        );
        showError(err);
      },
    },
  );
};
