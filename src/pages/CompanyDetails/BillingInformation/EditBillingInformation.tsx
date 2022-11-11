import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';

import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {BillingInformationCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<BillingInformationCompanyFormModel>;
}

export const currencies = [
  {
    label: 'USD',
    value: 'USD',
  },
  {
    label: 'Euro',
    value: 'EUR',
  },
  {
    label: 'Pound',
    value: 'GBP',
  },
  {
    label: 'Yen',
    value: 'JPY',
  },
];

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
        <FormSelect
          labelId="currencySelect-label"
          label="Currency"
          options={currencies.map(({label, value}) => ({
            label,
            value,
          }))}
          selectProps={{
            id: 'currencySelect',
            value: formik.values.currencies[0],
            error: !!(formik.touched.currencies && formik.errors.currencies),
            name: 'currencies',
            onChange: (event) =>
              formik.setFieldValue('currencies', [event.target.value]),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>
    </Grid>
  );
};
