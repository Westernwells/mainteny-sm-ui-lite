import {useMutation, useQuery, useQueryClient} from 'react-query';
import {RestError, StringValue} from 'models/misc';
import {axiosClient} from 'utils/axios-utils';
import {queryKeys as qk} from 'reactQuery/constants';
import {VatView} from 'models/vat';
import {useSnackbar} from 'hooks/useSnackbar';
import {useUserSession} from './useUserSession';

const fetchVats = async (serviceCompanyId: string): Promise<VatView[]> => {
  const response = await axiosClient.get<VatView[]>(
    `/api/serviceCompanies/${serviceCompanyId}/vats`,
  );
  return response.data;
};

export const useVats = () => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';
  return useQuery<VatView[], RestError>([qk.fetchVats, serviceCompanyId], () =>
    fetchVats(serviceCompanyId),
  );
};

const createVat = async (
  serviceCompanyId: string,
  vat: VatView,
): Promise<StringValue> =>
  axiosClient.post(`/api/serviceCompanies/${serviceCompanyId}/vats`, vat);

export const useCreateVat = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';
  return useMutation((vat: VatView) => createVat(serviceCompanyId, vat), {
    onSuccess: () => {
      enqueueSnackbar('Tax rates updated', {
        variant: 'success',
      });
      queryClient.invalidateQueries([qk.fetchVats]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const updateVat = async (
  serviceCompanyId: string,
  vat: VatView,
): Promise<StringValue> =>
  axiosClient.put(
    `/api/serviceCompanies/${serviceCompanyId}/vats/${vat.id}`,
    vat,
  );

export const useUpdateVat = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';
  return useMutation((vat: VatView) => updateVat(serviceCompanyId, vat), {
    onSuccess: () => {
      enqueueSnackbar('Tax rates updated', {
        variant: 'success',
      });
      queryClient.invalidateQueries([qk.fetchVats]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const deleteVat = async (
  serviceCompanyId: string,
  vatId: string,
): Promise<StringValue> =>
  axiosClient.delete(`/api/serviceCompanies/${serviceCompanyId}/vats/${vatId}`);

export const useDeleteVat = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';
  return useMutation((vatId: string) => deleteVat(serviceCompanyId, vatId), {
    onSuccess: () => {
      enqueueSnackbar('Tax rates updated', {
        variant: 'success',
      });
      queryClient.invalidateQueries([qk.fetchVats]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};
