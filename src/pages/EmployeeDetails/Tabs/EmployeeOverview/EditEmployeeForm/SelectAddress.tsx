import React from 'react';
import {useFormikContext} from 'formik';
import {Box} from '@mui/material';

import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {EmployeeAccountData} from './model';

export const SelectAddress = () => {
  const {setFieldValue, values, errors, touched, handleBlur} =
    useFormikContext<EmployeeAccountData>();

  return (
    <Box>
      <AddressAutoComplete
        initialValue={values.address?.fullName || ''}
        inputError={errors.address && touched.address ? errors.address : ''}
        handleBlur={handleBlur}
        textFieldProps={{
          placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
          required: true,
        }}
        getAddress={(address) => setFieldValue('address', address)}
      />
    </Box>
  );
};
