import {useTranslation} from 'react-i18next';
import {Resource, StringValue, WithOptional} from 'models/misc';
import {
  PropertyOwnerView,
  QueryPropertyOwnersParams,
} from 'models/propertyManager';
import {useSnackbar} from 'hooks/useSnackbar';
import {CustomerEditForm} from 'pages/CustomerDetails/Tabs/CustomerOverview/EditCustomerForm/model';
import {NewCustomerBody} from 'pages/NewCustomer/model';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {queryKeys as qks, queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {formatUpdateCustomer} from 'utils/customer-utils';
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

const createCustomer = async (body: NewCustomerBody): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('api/propertyOwners', {
    ...body,
  });
  return response.data;
};

export const useCreateCustomer = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation((body: NewCustomerBody) => createCustomer(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
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

  const updateCustomer = async (
    data: CustomerEditForm,
    propertyOwnerId: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    const requestBody = formatUpdateCustomer(data);
    try {
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
    }
  };

  return {
    updateCustomer,
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
