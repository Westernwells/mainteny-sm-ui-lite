import {useSnackbar} from 'hooks/useSnackbar';
import {useMutation, useQueryClient} from 'react-query';
import * as Sentry from '@sentry/react';

export const useServiceOrderCommentMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: string,
) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
    },
    onError: (err) => {
      Sentry.captureException(err);
      showError(err);
    },
  });
};
