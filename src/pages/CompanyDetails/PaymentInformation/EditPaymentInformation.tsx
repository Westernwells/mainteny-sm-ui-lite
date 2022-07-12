import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';

import {FormInput} from 'components/form/FormInput';
import {PaymentInformationCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<PaymentInformationCompanyFormModel>;
}

export const EditPaymentInformation = ({formik}: Props) => {
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
            placeholder: 'e.g. DE00 0000 0000 0000 0000 00',
            label: 'IBAN',
            name: 'iban',
            helperText: formik.touched.iban && formik.errors.iban,
            error: !!formik.errors.iban && formik.touched.iban,
            required: true,
            value: formik.values.iban,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. DEUTDE8CXXX',
            label: 'BIC',
            name: 'bic',
            required: true,
            helperText: formik.touched.bic && formik.errors.bic,
            error: !!formik.errors.bic && formik.touched.bic,
            value: formik.values.bic,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. 0532013000',
            label: 'Account Number',
            name: 'accountNumber',
            helperText:
              formik.touched.accountNumber && formik.errors.accountNumber,
            error:
              !!formik.errors.accountNumber && formik.touched.accountNumber,
            value: formik.values.accountNumber,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};
