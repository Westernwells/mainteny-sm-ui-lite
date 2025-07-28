import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {I18nextProvider} from 'react-i18next';
import {SnackbarProvider} from 'notistack';
import type {UseFormReturn, UseFormProps, FieldValues} from 'react-hook-form';
import {render, renderHook} from '@testing-library/react';
import {useForm} from 'react-hook-form';
import i18n from 'i18n';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>{ui}</SnackbarProvider>
      </QueryClientProvider>
    </I18nextProvider>,
  );
}

export function createFormMethods<T extends FieldValues>(
  defaultValues: UseFormProps<T>['defaultValues'],
): UseFormReturn<T> {
  const {result} = renderHook(() => useForm<T>({defaultValues}));
  return result.current;
}
