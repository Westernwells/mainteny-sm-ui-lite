import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {StringValue} from 'models/misc';
import {
  NewContractPaymentTermBody,
  UpdateContractPaymentTermRecord,
} from 'models/contract';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';

const createContractPaymentTerm = async (
  body: NewContractPaymentTermBody,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    '/api/contractPaymentTerms',
    {
      ...body,
    },
  );
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
      queryClient.invalidateQueries([queryKeys.queryContractPaymentTerms]);
    },
    onError: (err) => {
      console.log(err);
      showError(err);
    },
  });
};

const updateContractPaymentTerm = async (
  body: UpdateContractPaymentTermRecord,
  paymentTermId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/contractPaymentTerms/${paymentTermId}`,
    {
      ...body,
    },
  );
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
        queryClient.invalidateQueries(queryKeys.queryContractPaymentTerms);
        queryClient.invalidateQueries(queryKeys.contractDetails);
        queryClient.invalidateQueries(queryKeys.invoiceById);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const deleteContractPaymentTerm = async (paymentTermId: string) => {
  await axiosClient.delete<StringValue>(
    `/api/contractPaymentTerms/${paymentTermId}`,
  );
};

export const useDeleteContractPaymentTerm = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({paymentTermId}: {paymentTermId: string}) =>
      deleteContractPaymentTerm(paymentTermId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryContractPaymentTerms);
        queryClient.invalidateQueries(queryKeys.invoiceById);
        queryClient.invalidateQueries(queryKeys.contractDetails);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};
