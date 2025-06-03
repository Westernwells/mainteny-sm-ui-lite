import {describe, it, expect, beforeEach, vi} from 'vitest';
import type {ContractTermView} from 'models/contract';
import {AddressComponent} from 'models/misc';
import {PropertyOwnerView} from 'models/propertyManager';
import {QuotationView} from 'models/quotation';
import {getFormattedPaymentTerms} from 'utils/invoice';
import {handleSelectCustomer} from './mocks/handleSelectCustomer';

describe('handleSelectCustomer', () => {
  let skipInitialCustomerSelect: {current: boolean};
  let mockSetCustomer: ReturnType<typeof vi.fn>;
  let mockAppendCustomerLegalNote: ReturnType<typeof vi.fn>;
  let mockSetValue: ReturnType<typeof vi.fn>;

  function makeCustomer(
    id: string,
    billing?: AddressComponent,
    beneficiary?: AddressComponent,
    other?: AddressComponent,
    paymentTerm?: ContractTermView,
  ): PropertyOwnerView {
    return {
      id,
      name: `Customer ${id}`,
      number: '',
      billingAddress: billing
        ? {
            id: 'f63d3cef-2a25-4265-aa75-07f3e3dab337',
            fullName: null,
            component: billing,
          }
        : undefined,
      beneficiaryAddress: beneficiary
        ? {
            id: 'd292b5bb-a8a4-44f9-bfdf-237bbb0d25ec',
            fullName: null,
            component: beneficiary,
          }
        : undefined,
      otherAddress: other
        ? {
            id: 'f63d3cef-2a25-4265-aa75-07f3e3dab337',
            fullName: null,
            component: other,
          }
        : undefined,
      businessAddress: undefined,
      postalAddress: undefined,
      search: '',
      unitNumber: undefined,
      labels: [],
      externalId: '',
      serviceCompany: undefined,
      contactPersons: undefined,
      paymentTerm: paymentTerm ?? undefined,
    } as any;
  }

  function makeQuotation(
    customerId: string,
    savedBilling: AddressComponent | null,
    savedBeneficiary: AddressComponent | null,
    savedAlternative: AddressComponent | null,
  ): QuotationView {
    return {
      propertyOwner: {id: customerId} as PropertyOwnerView,
      additionalInfo: {
        billingAddress: savedBilling
          ? {
              id: 'f63d3cef-2a25-4265-aa75-07f3e3dab337',
              fullName: null,
              component: savedBilling,
            }
          : undefined,
        beneficiaryAddress: savedBeneficiary
          ? {
              id: 'd292b5bb-a8a4-44f9-bfdf-237bbb0d25ec',
              fullName: null,
              component: savedBeneficiary,
            }
          : undefined,
        alternativeAddress: savedAlternative
          ? {
              id: 'f63d3cef-2a25-4265-aa75-07f3e3dab337',
              fullName: null,
              component: savedAlternative,
            }
          : undefined,
      },
    } as any;
  }

  beforeEach(() => {
    skipInitialCustomerSelect = {current: true};
    mockSetCustomer = vi.fn();
    mockAppendCustomerLegalNote = vi.fn();
    mockSetValue = vi.fn();
  });

  it('1. Fresh NEW form, skipInitialCustomerSelect=true → setCustomer only, copy addresses', () => {
    const row = makeCustomer(
      '0f4c4866-2fa7-414f-a655-cacad6aa356d',
      {
        name: 'Kunde 1',
        street: 'Pacelliallee 45',
        city: 'Berlin',
        postalCode: '14195',
        state: 'Berlin',
        country: 'Germany',
      },
      {
        name: 'BenF Kunde',
        street: 'Friedrichstraße',
        city: 'Berlin',
        postalCode: '10117',
        state: 'Berlin',
        country: 'Deutschland',
      },
      {name: '', street: '', city: '', postalCode: '', state: '', country: ''},
    );

    handleSelectCustomer(row, {
      formType: 'new',
      pageState: 'FRESH_NEW',
      quotation: undefined,
      skipInitialCustomerSelect,
      setCustomer: mockSetCustomer,
      appendCustomerLegalNote: mockAppendCustomerLegalNote,
      setValue: mockSetValue,
    });

    expect(mockSetCustomer).toHaveBeenCalledTimes(1);
    expect(mockAppendCustomerLegalNote).not.toHaveBeenCalled();

    expect(mockSetValue).toHaveBeenCalledWith('billingAddress', {
      name: 'Kunde 1',
      street: 'Pacelliallee 45',
      city: 'Berlin',
      postalCode: '14195',
      state: 'Berlin',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith('beneficiaryAddress', {
      name: 'BenF Kunde',
      street: 'Friedrichstraße',
      city: 'Berlin',
      postalCode: '10117',
      state: 'Berlin',
      country: 'Deutschland',
    });
    expect(mockSetValue).toHaveBeenCalledWith('alternativeAddress', {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
    });
    expect(mockSetValue).toHaveBeenCalledWith(
      'propertyOwnerId',
      '0f4c4866-2fa7-414f-a655-cacad6aa356d',
    );
    expect(mockSetValue).not.toHaveBeenCalledWith(
      'paymentTerms',
      expect.anything(),
    );
  });

  it('2. Fresh NEW form, skipInitialCustomerSelect=false → append note, copy addresses + set paymentTerms', () => {
    skipInitialCustomerSelect.current = false;
    const term: ContractTermView = {
      id: '5a0f4d7e-bf39-4a18-a4aa-8799f5563c11',
      term: '8 Tage netto',
      data: {
        discountOptions: [
          {discountDays: 0, discountPercent: 0, articleType: 'ALL'},
        ],
        dueDays: 8,
      },
    } as any;
    const row = makeCustomer(
      'b270952a-7d58-458f-8259-4fd4091612fd',
      {
        name: 'Kunde 1',
        street: 'Pacelliallee 45',
        city: 'Berlin',
        postalCode: '14195',
        state: 'Berlin',
        country: 'Germany',
      },
      {
        name: 'BenF Kunde',
        street: 'Friedrichstraße',
        city: 'Berlin',
        postalCode: '10117',
        state: 'Berlin',
        country: 'Deutschland',
      },
      {name: '', street: '', city: '', postalCode: '', state: '', country: ''},
      term,
    );

    handleSelectCustomer(row, {
      formType: 'new',
      pageState: 'FRESH_NEW',
      quotation: undefined,
      skipInitialCustomerSelect,
      setCustomer: mockSetCustomer,
      appendCustomerLegalNote: mockAppendCustomerLegalNote,
      setValue: mockSetValue,
    });

    expect(mockSetCustomer).toHaveBeenCalledTimes(1);
    expect(mockAppendCustomerLegalNote).toHaveBeenCalledTimes(1);
    expect(mockAppendCustomerLegalNote).toHaveBeenCalledWith(row);

    expect(mockSetValue).toHaveBeenCalledWith('billingAddress', {
      name: 'Kunde 1',
      street: 'Pacelliallee 45',
      city: 'Berlin',
      postalCode: '14195',
      state: 'Berlin',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith('beneficiaryAddress', {
      name: 'BenF Kunde',
      street: 'Friedrichstraße',
      city: 'Berlin',
      postalCode: '10117',
      state: 'Berlin',
      country: 'Deutschland',
    });
    expect(mockSetValue).toHaveBeenCalledWith('alternativeAddress', {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
    });
    expect(mockSetValue).toHaveBeenCalledWith(
      'propertyOwnerId',
      'b270952a-7d58-458f-8259-4fd4091612fd',
    );

    const expectedPaymentTerms = getFormattedPaymentTerms(term);
    expect(mockSetValue).toHaveBeenCalledWith(
      'paymentTerms',
      expectedPaymentTerms,
    );
  });

  it('3. EDIT form, pick same customer → restore quotation addresses', () => {
    const savedBilling = {
      name: 'Kunde 1',
      street: 'Pacelliallee 45',
      city: 'Berlin',
      postalCode: '14195',
      state: 'Berlin',
      country: 'Germany',
    };
    const savedBeneficiary = {
      name: 'BenF Kunde',
      street: 'Friedrichstraße',
      city: 'Berlin',
      postalCode: '10117',
      state: 'Berlin',
      country: 'Deutschland',
    };
    const savedAlternative = {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
    };
    const quotation = makeQuotation(
      'b270952a-7d58-458f-8259-4fd4091612fd',
      savedBilling,
      savedBeneficiary,
      savedAlternative,
    );

    const row = makeCustomer(
      'b270952a-7d58-458f-8259-4fd4091612fd',
      {
        name: 'IGNORE',
        street: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
      },
      {
        name: 'IGNORE',
        street: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
      },
      {
        name: 'IGNORE',
        street: '',
        city: '',
        postalCode: '',
        state: '',
        country: '',
      },
    );

    skipInitialCustomerSelect.current = false;
    handleSelectCustomer(row, {
      formType: 'edit',
      pageState: 'EDIT_EXISTING',
      quotation,
      skipInitialCustomerSelect,
      setCustomer: mockSetCustomer,
      appendCustomerLegalNote: mockAppendCustomerLegalNote,
      setValue: mockSetValue,
    });

    expect(mockSetCustomer).toHaveBeenCalledTimes(1);
    expect(mockAppendCustomerLegalNote).toHaveBeenCalledTimes(1);

    expect(mockSetValue).toHaveBeenCalledWith('billingAddress', savedBilling);
    expect(mockSetValue).toHaveBeenCalledWith(
      'beneficiaryAddress',
      savedBeneficiary,
    );
    expect(mockSetValue).toHaveBeenCalledWith(
      'alternativeAddress',
      savedAlternative,
    );
    expect(mockSetValue).toHaveBeenCalledWith(
      'propertyOwnerId',
      'b270952a-7d58-458f-8259-4fd4091612fd',
    );
    expect(mockSetValue).not.toHaveBeenCalledWith(
      'paymentTerms',
      expect.anything(),
    );
  });

  it('4. EDIT form, pick DIFFERENT customer → copy new addresses', () => {
    const savedBilling = {
      name: 'Kunde 1',
      street: 'Pacelliallee 45',
      city: 'Berlin',
      postalCode: '14195',
      state: 'Berlin',
      country: 'Germany',
    };
    const savedBeneficiary = {
      name: 'BenF Kunde',
      street: 'Friedrichstraße',
      city: 'Berlin',
      postalCode: '10117',
      state: 'Berlin',
      country: 'Deutschland',
    };
    const savedAlternative = {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
    };
    const quotation = makeQuotation(
      'b270952a-7d58-458f-8259-4fd4091612fd',
      savedBilling,
      savedBeneficiary,
      savedAlternative,
    );

    const row = makeCustomer(
      '0f4c4866-2fa7-414f-a655-cacad6aa356d',
      {
        name: 'Neue Kunde',
        street: 'Hauptstraße 1',
        city: 'Hamburg',
        postalCode: '20095',
        state: 'HH',
        country: 'Germany',
      },
      {
        name: 'Neue Benef',
        street: 'Münzstraße 2',
        city: 'Hamburg',
        postalCode: '20095',
        state: 'HH',
        country: 'Germany',
      },
      {
        name: 'Neue Alt',
        street: 'Nebenstraße 3',
        city: 'Hamburg',
        postalCode: '20095',
        state: 'HH',
        country: 'Germany',
      },
    );

    skipInitialCustomerSelect.current = false;
    handleSelectCustomer(row, {
      formType: 'edit',
      pageState: 'EDIT_EXISTING',
      quotation,
      skipInitialCustomerSelect,
      setCustomer: mockSetCustomer,
      appendCustomerLegalNote: mockAppendCustomerLegalNote,
      setValue: mockSetValue,
    });

    expect(mockSetCustomer).toHaveBeenCalledTimes(1);
    expect(mockAppendCustomerLegalNote).toHaveBeenCalledTimes(1);

    expect(mockSetValue).toHaveBeenCalledWith('billingAddress', {
      name: 'Neue Kunde',
      street: 'Hauptstraße 1',
      city: 'Hamburg',
      postalCode: '20095',
      state: 'HH',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith('beneficiaryAddress', {
      name: 'Neue Benef',
      street: 'Münzstraße 2',
      city: 'Hamburg',
      postalCode: '20095',
      state: 'HH',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith('alternativeAddress', {
      name: 'Neue Alt',
      street: 'Nebenstraße 3',
      city: 'Hamburg',
      postalCode: '20095',
      state: 'HH',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith(
      'propertyOwnerId',
      '0f4c4866-2fa7-414f-a655-cacad6aa356d',
    );
    expect(mockSetValue).not.toHaveBeenCalledWith(
      'paymentTerms',
      expect.anything(),
    );
  });

  it('5. CONTINUE_NEW form → copy new addresses, no paymentTerms', () => {
    const row = makeCustomer(
      'f63d3cef-2a25-4265-aa75-07f3e3dab337',
      {
        name: 'Local Kunde',
        street: 'Beispielweg 10',
        city: ' München',
        postalCode: '80333',
        state: 'BY',
        country: 'Germany',
      },
      {
        name: 'Local Benef',
        street: 'Teststraße 5',
        city: ' München',
        postalCode: '80333',
        state: 'BY',
        country: 'Germany',
      },
      {
        name: 'Local Alt',
        street: 'Altweg 2',
        city: ' München',
        postalCode: '80333',
        state: 'BY',
        country: 'Germany',
      },
    );

    skipInitialCustomerSelect.current = false;
    handleSelectCustomer(row, {
      formType: 'new',
      pageState: 'CONTINUE_NEW',
      quotation: undefined,
      skipInitialCustomerSelect,
      setCustomer: mockSetCustomer,
      appendCustomerLegalNote: mockAppendCustomerLegalNote,
      setValue: mockSetValue,
    });

    expect(mockSetCustomer).toHaveBeenCalledTimes(1);
    expect(mockAppendCustomerLegalNote).toHaveBeenCalledTimes(1);

    expect(mockSetValue).toHaveBeenCalledWith('billingAddress', {
      name: 'Local Kunde',
      street: 'Beispielweg 10',
      city: ' München',
      postalCode: '80333',
      state: 'BY',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith('beneficiaryAddress', {
      name: 'Local Benef',
      street: 'Teststraße 5',
      city: ' München',
      postalCode: '80333',
      state: 'BY',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith('alternativeAddress', {
      name: 'Local Alt',
      street: 'Altweg 2',
      city: ' München',
      postalCode: '80333',
      state: 'BY',
      country: 'Germany',
    });
    expect(mockSetValue).toHaveBeenCalledWith(
      'propertyOwnerId',
      'f63d3cef-2a25-4265-aa75-07f3e3dab337',
    );
    expect(mockSetValue).not.toHaveBeenCalledWith(
      'paymentTerms',
      expect.anything(),
    );
  });
});
