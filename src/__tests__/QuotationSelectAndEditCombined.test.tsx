import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryClient, QueryClientProvider} from 'react-query';
import {I18nextProvider} from 'react-i18next';
import {QuotationSelectAndEditCombined} from 'components/QuotationSelectAndEditCombined';
import {AddressRecord} from 'models/misc';
import {QuotationFormData} from 'models/quotation';
import {
  Control,
  UseFormGetValues,
  UseFormRegister,
  UseFormReturn,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {SnackbarProvider} from 'notistack';
import i18n from './config/i18n';

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>{ui} </SnackbarProvider>
      </QueryClientProvider>
    </I18nextProvider>,
  );

const testAddress: AddressRecord = {
  fullName: 'Test Address Full',
  countryCode: 'US',
  component: {
    name: 'Test Address',
    street: '123 Main St',
    city: 'Testville',
    postalCode: '12345',
    country: 'USA',
  },
};

const testFormData: Partial<QuotationFormData> = {
  serviceCompanyId: 'b270952a-7d58-458f-8259-4fd4091612fd',
  items: [],
  billingAddress: {...testAddress},
  beneficiaryAddress: {...testAddress},
  alternativeAddress: {...testAddress},
};

let testGetValues: UseFormGetValues<QuotationFormData>;
let testSetValue: UseFormSetValue<QuotationFormData>;
let mockedFormMethod: UseFormReturn<QuotationFormData>;

beforeEach(() => {
  testGetValues = vi.fn(
    (): QuotationFormData => ({...testFormData} as QuotationFormData),
  ) as unknown as UseFormGetValues<QuotationFormData>;
  testSetValue = vi.fn() as unknown as UseFormSetValue<QuotationFormData>;

  const control = {
    _subjects: {
      array: {next: vi.fn(), subscribe: vi.fn()},
      state: {next: vi.fn(), subscribe: vi.fn()},
      watch: {next: vi.fn(), subscribe: vi.fn()},
    },
    _names: {
      array: new Set(),
      mount: new Set(),
      unMount: new Set(),
      watch: new Set(),
      focus: '',
    },
    _state: {
      mount: false,
      action: false,
      watch: false,
    },
    _fields: {},
    _defaultValues: {},
    _formValues: {},
    _stateFlags: {
      mount: false,
      action: false,
      watch: false,
    },
    _options: {
      mode: 'onSubmit' as const,
      reValidateMode: 'onChange' as const,
      shouldFocusError: true,
    },
    _getDirty: vi.fn(),
    _getWatch: vi.fn(),
    _updateValid: vi.fn(),
    _removeUnmounted: vi.fn(),
    _updateFieldArray: vi.fn(),
    register: vi.fn(() => ({})),
    unregister: vi.fn(),
    getFieldState: vi.fn(),
    handleSubmit: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    setValue: vi.fn(),
    trigger: vi.fn(),
    formState: {
      isDirty: false,
      isLoading: false,
      isSubmitted: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
      isValidating: false,
      submitCount: 0,
      defaultValues: {},
      dirtyFields: {},
      touchedFields: {},
      errors: {},
    },
    _executeSchema: vi.fn(),
    _getFieldArray: vi.fn(),
    _reset: vi.fn(),
    _resetDefaultValues: vi.fn(),
    _setErrors: vi.fn(),
    _updateDisabledField: vi.fn(),
  } as unknown as Control<QuotationFormData>;

  mockedFormMethod = {
    getValues: testGetValues,
    setValue: testSetValue,
    watch: vi.fn() as unknown as UseFormWatch<QuotationFormData>,
    register: vi.fn() as unknown as UseFormRegister<QuotationFormData>,
    control,
  } as UseFormReturn<QuotationFormData>;
});

describe('QuotationSelectAndEditCombined', () => {
  it('renders add button when not selected', () => {
    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        formMethods={mockedFormMethod}
      />,
    );
    expect(
      screen.getByRole('button', {name: /add billing address/i}),
    ).toBeInTheDocument();
  });

  it('opens modal when add button is clicked', () => {
    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        formMethods={mockedFormMethod}
      />,
    );
    const addButton = screen.getByRole('button', {
      name: /add billing address/i,
    });
    fireEvent.click(addButton);
    expect(screen.getByText('Edit Billing Address')).toBeInTheDocument();
  });

  it('disables Save button if the component name is empty', async () => {
    const emptyNameAddress: AddressRecord = {
      fullName: '',
      countryCode: 'US',
      component: {
        name: '',
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    };
    const modifiedFormData: Partial<QuotationFormData> = {
      ...testFormData,
      billingAddress: emptyNameAddress,
    };

    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        formMethods={{
          ...mockedFormMethod,
          getValues: vi.fn(
            (): QuotationFormData =>
              ({...modifiedFormData} as QuotationFormData),
          ) as unknown as UseFormGetValues<QuotationFormData>,
        }}
      />,
    );

    const addButton = screen.getByRole('button', {
      name: /add billing address/i,
    });
    fireEvent.click(addButton);
    const saveButton = screen.getByRole('button', {name: /save/i});
    expect(saveButton).toBeDisabled();
  });

  it('reverts to saved initial value when modal is cancelled', async () => {
    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        formMethods={mockedFormMethod}
      />,
    );

    const addButton = screen.getByRole('button', {
      name: /add billing address/i,
    });
    fireEvent.click(addButton);

    const modifiedAddress: AddressRecord = {
      fullName: 'Modified Address Full',
      countryCode: 'CA',
      component: {
        name: 'Modified Address',
        street: '456 Other St',
        city: 'ModCity',
        postalCode: '54321',
        country: 'Canada',
      },
    };

    testGetValues = vi.fn(
      (): QuotationFormData => ({
        billingAddress: modifiedAddress,
        beneficiaryAddress: testAddress,
        alternativeAddress: testAddress,
        serviceCompanyId: 'b270952a-7d58-458f-8259-4fd4091612fd',
        items: [],
      }),
    ) as unknown as UseFormGetValues<QuotationFormData>;

    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        formMethods={{
          ...mockedFormMethod,
          getValues: testGetValues,
        }}
      />,
    );

    const cancelButton = screen.getByRole('button', {name: /cancel/i});
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(testSetValue).toHaveBeenCalledWith('billingAddress', testAddress);
    });
  });

  it('calls setValue with updated value when modal is saved', async () => {
    const identityTranslate = ((str: string) =>
      str) as unknown as import('i18next').TFunction<
      'translation',
      'translation'
    >;
    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        translate={identityTranslate}
        formMethods={mockedFormMethod}
      />,
    );
    const addButton = screen.getByRole('button', {
      name: /add billing address/i,
    });
    fireEvent.click(addButton);
    const saveButton = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButton);

    const expectedAddress: AddressRecord = {
      ...testAddress,
      component: {
        ...testAddress.component!,
        country: testAddress.component!.country,
      },
      fullName: 'Test Address, 123 Main St, 12345, Testville, USA',
    };

    await waitFor(() => {
      expect(testSetValue).toHaveBeenCalledWith(
        'billingAddress',
        expectedAddress,
      );
    });
  });
});
