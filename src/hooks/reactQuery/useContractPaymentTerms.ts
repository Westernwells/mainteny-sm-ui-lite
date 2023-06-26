import {useMutation, useQueryClient} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {StringValue} from 'models/misc';
import {NewContractPaymentTermBody} from 'models/contract';
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
