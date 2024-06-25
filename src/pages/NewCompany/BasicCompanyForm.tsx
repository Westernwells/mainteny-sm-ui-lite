import {useEffect} from 'react';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {InputAdornment} from '@mui/material';
import {Email, Phone} from '@mui/icons-material';

import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {PageCard} from 'components/PageCard';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import {BasicInformationFormModel} from './model';

interface Props {
  getBasicCompanyFormErrors?: (
    val: FormikErrors<BasicInformationFormModel>,
  ) => void;
  getBasicCompanyFormValues?: (val: BasicInformationFormModel) => void;
  initialValues: BasicInformationFormModel;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
  postalAddress: Yup.object().nullable().required('Postal Address is required'),
  billingAddress: Yup.object()
    .nullable()
    .required('Billing Address is required'),
  businessAddress: Yup.object()
    .nullable()
    .required('Business Address is required'),
});

export const BasicCompanyForm = ({
  getBasicCompanyFormErrors,
  getBasicCompanyFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<BasicInformationFormModel>({
    initialValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      url: initialValues?.url || '',
      email: initialValues?.email || '',
      postalAddress: initialValues?.postalAddress || null,
      billingAddress: initialValues?.billingAddress || null,
      businessAddress: initialValues?.businessAddress || null,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getBasicCompanyFormErrors) {
      getBasicCompanyFormErrors(formik.errors);
    }

    if (getBasicCompanyFormValues) {
      getBasicCompanyFormValues(formik.values);
    }
  }, [formik]);

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <PageCard
      headerLabel="Basic Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item md={5}>
            <FormInput
              fieldProps={{
                size: 'small',
                placeholder: 'e.g. 1&1 Drillisch AG',
                label: 'Name',
                name: 'name',
                value: formik.values.name,
                helperText: formik.touched.name && formik.errors.name,
                error: !!formik.errors.name && formik.touched.name,
                required: true,
                sx: {
                  mt: '0.5em',
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={5}>
            <FormInput
              fieldProps={{
                size: 'small',
                placeholder: 'e.g. brucewayne@gmail.com',
                label: 'Email',
                name: 'email',
                value: formik.values.email,
                helperText: formik.touched.email && formik.errors.email,
                error: !!formik.errors.email && formik.touched.email,
                required: true,
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email />
                    </InputAdornment>
                  ),
                },
                sx: {
                  mt: '0.5em',
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={5}>
            <FormInput
              fieldProps={{
                size: 'small',
                placeholder: 'e.g. +1234567890',
                label: 'Phone',
                name: 'phone',
                value: formik.values.phone,
                helperText: formik.errors.phone,
                error: !!formik.errors.phone,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start"> + </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Phone />
                    </InputAdornment>
                  ),
                },
                sx: {
                  mt: '0.5em',
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={5}>
            <FormInput
              fieldProps={{
                size: 'small',
                placeholder: 'e.g. www.yourcompany.com',
                label: 'Website / URL',
                name: 'url',
                value: formik.values.url,
                helperText: formik.errors.url,
                error: !!formik.errors.url,
                sx: {
                  mt: '0.5em',
                },
                ...defaultProps,
              }}
            />
          </Grid>

          <Grid item md={5}>
            <Box marginTop="0.5em" width="100%">
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
                  onBlur: formik.handleBlur,
                  placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
                  required: true,
                }}
                label="Billing Address"
                getAddress={(address) =>
                  formik.setFieldValue('billingAddress', address)
                }
              />
            </Box>
          </Grid>
          <Grid item md={5}>
            <Box marginTop="0.5em" width="100%">
              <AddressAutoComplete
                initialValue={formik.values.businessAddress?.fullName || ''}
                inputError={
                  formik.errors.businessAddress &&
                  formik.touched.businessAddress
                    ? formik.errors.businessAddress
                    : ''
                }
                handleBlur={formik.handleBlur}
                textFieldProps={{
                  name: 'businessAddress',
                  onBlur: formik.handleBlur,
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
          <Grid item md={5}>
            <Box marginTop="0.5em" width="100%">
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
                  onBlur: formik.handleBlur,
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
      </Box>
    </PageCard>
  );
};
