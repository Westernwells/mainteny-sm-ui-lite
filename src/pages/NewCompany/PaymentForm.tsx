import {useEffect} from 'react';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';

import {PageCard} from 'components/PageCard';
import {FormInput} from 'components/form/FormInput';
import {PaymentFormModel} from './model';

interface Props {
  getPaymentFormErrors?: (val: FormikErrors<PaymentFormModel>) => void;
  getPaymentFormValues?: (val: PaymentFormModel) => void;
  initialValues: PaymentFormModel;
}

const validationSchema = Yup.object().shape({
  vatId: Yup.string().nullable().required('VAT ID is required'),
  percentageVat: Yup.number()
    .nullable()
    .required('% VAT is required')
    .min(0, 'Minimum 0')
    .max(100, 'Maximum 100'),
  iban: Yup.string().nullable().required('IBAN is required'),
  bic: Yup.string().nullable().required('BIC is required'),
});

export const PaymentForm = ({
  getPaymentFormErrors,
  getPaymentFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<PaymentFormModel>({
    initialValues: {
      vatId: initialValues?.vatId || '',
      percentageVat: initialValues?.percentageVat || '',
      iban: initialValues?.iban || '',
      bic: initialValues?.bic || '',
      accountNumber: initialValues?.accountNumber || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getPaymentFormErrors) {
      getPaymentFormErrors(formik.errors);
    }

    if (getPaymentFormValues) {
      getPaymentFormValues(formik.values);
    }
  }, [formik]);

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <PageCard
      headerLabel="Payment Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item xs={5}>
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
          <Grid item xs={5}>
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
          <Grid item xs={5}>
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
          <Grid item xs={5}>
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
          <Grid item xs={5}>
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
        </Grid>
      </Box>
    </PageCard>
  );
};
