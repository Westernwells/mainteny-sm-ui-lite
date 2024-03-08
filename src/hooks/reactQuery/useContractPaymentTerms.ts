import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {StringValue} from 'models/misc';
import {
  NewContractPaymentTermBody,
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
      console.log(err);
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
        console.log(err);
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
        console.log(err);
        showError(err);
      },
    },
  );
};
