import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {QueryClient, QueryClientProvider} from 'react-query';
import {I18nextProvider} from 'react-i18next';
import {QuotationSelectAndEditCombined} from 'components/QuotationSelectAndEditCombined';
import {AddressRecord} from 'models/misc';
import {QuotationFormData} from 'models/quotation';
import {UseFormGetValues, UseFormSetValue} from 'react-hook-form';
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

beforeEach(() => {
  testGetValues = vi.fn(
    (): QuotationFormData => ({...testFormData} as QuotationFormData),
  ) as unknown as UseFormGetValues<QuotationFormData>;
  testSetValue = vi.fn() as unknown as UseFormSetValue<QuotationFormData>;
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
        setValue={testSetValue}
        getValues={testGetValues}
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
        setValue={testSetValue}
        getValues={testGetValues}
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
    testGetValues = vi.fn(
      (): QuotationFormData => ({...modifiedFormData} as QuotationFormData),
    ) as unknown as UseFormGetValues<QuotationFormData>;

    renderWithProviders(
      <QuotationSelectAndEditCombined
        label="Billing Address"
        selected={false}
        buttonText="Add Billing Address"
        editButtonText="Edit Billing Address"
        modalHeader="Edit Billing Address"
        addressType="billingAddress"
        setValue={testSetValue}
        getValues={testGetValues}
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
        setValue={testSetValue}
        getValues={testGetValues}
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
        setValue={testSetValue}
        getValues={testGetValues}
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
        setValue={testSetValue}
        getValues={testGetValues}
        translate={identityTranslate}
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
