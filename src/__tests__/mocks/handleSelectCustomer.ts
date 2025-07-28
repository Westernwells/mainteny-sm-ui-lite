import type {MutableRefObject} from 'react';
import type {PropertyOwnerView} from 'models/propertyManager';
import type {QuotationView} from 'models/quotation';
import {getFormattedPaymentTerms} from 'utils/invoice';

export const handleSelectCustomer = (
  row: PropertyOwnerView,
  opts: {
    formType: 'new' | 'edit';
    pageState: 'FRESH_NEW' | 'CONTINUE_NEW' | string;
    quotation?: QuotationView;
    skipInitialCustomerSelect: MutableRefObject<boolean>;
    setCustomer: (c: PropertyOwnerView) => void;
    appendCustomerLegalNote: (c: PropertyOwnerView) => void;
    setValue: <
      K extends
        | 'billingAddress'
        | 'beneficiaryAddress'
        | 'alternativeAddress'
        | 'propertyOwnerId'
        | 'paymentTerms',
    >(
      field: K,
      value: any,
    ) => void;
  },
) => {
  const {
    formType,
    pageState,
    quotation,
    skipInitialCustomerSelect,
    setCustomer,
    appendCustomerLegalNote,
    setValue,
  } = opts;

  setCustomer(row);

  if (skipInitialCustomerSelect.current) {
    skipInitialCustomerSelect.current = false;
  } else {
    appendCustomerLegalNote(row);
  }

  const quotationCustomerId = quotation?.propertyOwner?.id;
  const isNewCustomer = row.id !== quotationCustomerId;

  if (isNewCustomer) {
    setValue('billingAddress', row.billingAddress?.component ?? {});
    setValue('beneficiaryAddress', row.beneficiaryAddress?.component ?? {});
    setValue('alternativeAddress', row.otherAddress?.component ?? {});
  } else if (formType === 'edit') {
    setValue(
      'billingAddress',
      quotation?.additionalInfo.billingAddress?.component ?? {},
    );
    setValue(
      'beneficiaryAddress',
      quotation?.additionalInfo.beneficiaryAddress?.component ?? {},
    );
    setValue(
      'alternativeAddress',
      quotation?.additionalInfo.alternativeAddress?.component ?? {},
    );
  }
  setValue('propertyOwnerId', row.id);

  if (formType === 'new' && row.paymentTerm && pageState === 'FRESH_NEW') {
    setValue('paymentTerms', getFormattedPaymentTerms(row.paymentTerm));
  }
};
