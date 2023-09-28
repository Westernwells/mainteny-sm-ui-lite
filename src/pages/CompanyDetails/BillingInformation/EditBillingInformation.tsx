import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';

import {FormInput} from 'components/form/FormInput';
import {BillingInformationCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<BillingInformationCompanyFormModel>;
}

export const EditBillingInformation = ({formik}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. DE 123456789',
            label: 'VAT ID',
            name: 'vatId',
            helperText: formik.touched.vatId && formik.errors.vatId,
            error: !!formik.errors.vatId && formik.touched.vatId,
            required: true,
            value: formik.values.vatId,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. 0',
            label: '% VAT',
            name: 'percentageVat',
            type: 'number',
            required: true,
            helperText:
              formik.touched.percentageVat && formik.errors.percentageVat,
            error:
              !!formik.errors.percentageVat && formik.touched.percentageVat,
            value: formik.values.percentageVat,
            sx: {mb: '1em'},
            inputProps: {min: 0},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. 123456789',
            label: 'Tax Number',
            name: 'taxNumber',
            helperText: formik.touched.taxNumber && formik.errors.taxNumber,
            error: !!formik.errors.taxNumber && formik.touched.taxNumber,
            required: true,
            value: formik.values.taxNumber,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};
