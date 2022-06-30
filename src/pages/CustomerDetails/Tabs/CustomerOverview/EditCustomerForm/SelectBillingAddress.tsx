import React from 'react';
import {useFormikContext} from 'formik';
import {Box} from '@mui/material';

import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {CustomerEditForm} from './model';

export const SelectBillingAddress = () => {
  const {setFieldValue, values, errors, touched, handleBlur} =
    useFormikContext<CustomerEditForm>();

  return (
    <Box marginTop="0.5em" width="100%">
      <AddressAutoComplete
        initialValue={values.billingAddress?.fullName || ''}
        inputError={
          errors.billingAddress && touched.billingAddress
            ? errors.billingAddress
            : ''
        }
        handleBlur={handleBlur}
        textFieldProps={{
          name: 'billingAddress',
          placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
          required: true,
        }}
        label="Billing Address"
        getAddress={(address) => setFieldValue('billingAddress', address)}
      />
    </Box>
  );
};
