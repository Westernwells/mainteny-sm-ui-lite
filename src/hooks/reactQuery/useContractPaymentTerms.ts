import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {StringValue} from 'models/misc';
import {
  NewContractPaymentTermBody,
  PaymentTermRecord,
  UpdateContractPaymentTermRecord,
  UpdateContractTermRecord,
} from 'models/contract';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';

const createContractTerm = async (
  body: NewContractPaymentTermBody,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/terms', {
    ...body,
  });
  return response.data;
};

export const useCreateContractTerm = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(createContractTerm, {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries([queryKeys.queryContractTerms]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const updateContractTerm = async (
  body: UpdateContractTermRecord,
  termId: string,
) => {
  await axiosClient.put<StringValue>(`/api/terms/${termId}`, {
    ...body,
  });
};

export const useUpdateContractTerm = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({body, termId}: {body: UpdateContractTermRecord; termId: string}) =>
      updateContractTerm(body, termId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContractTerms);
        queryClient.invalidateQueries(queryKeys.contractDetails);
        queryClient.invalidateQueries(queryKeys.invoiceById);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const deleteContractTerm = async (termId: string) => {
  await axiosClient.delete<StringValue>(`/api/terms/${termId}`);
};

export const useDeleteContractTerm = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({termId}: {termId: string}) => deleteContractTerm(termId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContractTerms);
        queryClient.invalidateQueries(queryKeys.invoiceById);
        queryClient.invalidateQueries(queryKeys.contractDetails);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const createContractPaymentTerm = async (
  body: PaymentTermRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/terms/payment', {
    ...body,
  });
  return response.data;
};

export const useCreateContractPaymentTerm = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(createContractPaymentTerm, {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries([queryKeys.queryContractTerms]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const updateContractPaymentTerm = async (
  body: UpdateContractPaymentTermRecord,
  paymentTermId: string,
) => {
  await axiosClient.put<StringValue>(`/api/terms/payment/${paymentTermId}`, {
    ...body,
  });
};

export const useUpdateContractPaymentTerm = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      paymentTermId,
    }: {
      body: UpdateContractPaymentTermRecord;
      paymentTermId: string;
    }) => updateContractPaymentTerm(body, paymentTermId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContractTerms);
        queryClient.invalidateQueries(queryKeys.contractDetails);
        queryClient.invalidateQueries(queryKeys.invoiceById);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};
