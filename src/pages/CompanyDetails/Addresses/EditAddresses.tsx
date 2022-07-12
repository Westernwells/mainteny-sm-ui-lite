import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {Box} from '@mui/material';

import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {AddressesCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<AddressesCompanyFormModel>;
}

export const EditAddresses = ({formik}: Props) => (
  <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
    <Grid item xs={12}>
      <AddressAutoComplete
        initialValue={formik.values.billingAddress?.fullName || ''}
        inputError={
          formik.errors.billingAddress && formik.touched.billingAddress
            ? formik.errors.billingAddress
            : ''
        }
        handleBlur={formik.handleBlur}
        textFieldProps={{
          name: 'billingAddress',
          placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
          required: true,
        }}
        label="Billing Address"
        getAddress={(address) =>
          formik.setFieldValue('billingAddress', address)
        }
      />
    </Grid>
    <Grid item xs={12}>
      <Box marginTop="1em">
        <AddressAutoComplete
          initialValue={formik.values.businessAddress?.fullName || ''}
          inputError={
            formik.errors.businessAddress && formik.touched.businessAddress
              ? formik.errors.businessAddress
              : ''
          }
          handleBlur={formik.handleBlur}
          textFieldProps={{
            name: 'businessAddress',
            placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
            required: true,
          }}
          label="Business Address"
          getAddress={(address) =>
            formik.setFieldValue('businessAddress', address)
          }
        />
      </Box>
    </Grid>
    <Grid item xs={12}>
      <Box marginTop="1em">
        <AddressAutoComplete
          initialValue={formik.values.postalAddress?.fullName || ''}
          inputError={
            formik.errors.postalAddress && formik.touched.postalAddress
              ? formik.errors.postalAddress
              : ''
          }
          handleBlur={formik.handleBlur}
          textFieldProps={{
            name: 'postalAddress',
            placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
            required: true,
          }}
          label="Postal Address"
          getAddress={(address) =>
            formik.setFieldValue('postalAddress', address)
          }
        />
      </Box>
    </Grid>
  </Grid>
);
