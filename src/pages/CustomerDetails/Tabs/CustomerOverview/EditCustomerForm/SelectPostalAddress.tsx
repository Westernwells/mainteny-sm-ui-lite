import React from 'react';
import {useFormikContext} from 'formik';
import {Box} from '@mui/material';

import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {CustomerEditForm} from './model';

export const SelectPostalAddress = () => {
  const {setFieldValue, values, errors, touched, handleBlur} =
    useFormikContext<CustomerEditForm>();

  return (
    <Box marginTop="0.5em" width="100%">
      <AddressAutoComplete
        initialValue={values.postalAddress?.fullName || ''}
        inputError={
          errors.postalAddress && touched.postalAddress
            ? errors.postalAddress
            : ''
        }
        handleBlur={handleBlur}
        textFieldProps={{
          name: 'postalAddress',
          placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
          required: false,
        }}
        label="Postal Address"
        getAddress={(address) => setFieldValue('postalAddress', address)}
      />
    </Box>
  );
};
