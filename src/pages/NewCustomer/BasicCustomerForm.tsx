import {useEffect} from 'react';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {InputAdornment} from '@mui/material';
import {Email, Phone} from '@mui/icons-material';

import {PageCard} from 'components/PageCard';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FormInput} from 'components/form/FormInput';
import {DatePicker} from 'components/DatePicker';
import {BasicCustomerFormModel} from './model';

interface Props {
  getBasicCustomerFormErrors?: (
    val: FormikErrors<BasicCustomerFormModel>,
  ) => void;
  getBasicCustomerFormValues?: (val: BasicCustomerFormModel) => void;
  initialValues: BasicCustomerFormModel;
}

const phoneValidationRE =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
  postalAddress: Yup.object().nullable().required('Postal Address is required'),
  externalId: Yup.string().required('Customer number is required'),
  billingAddress: Yup.object()
    .nullable()
    .required('Billing Address is required'),
});

export const BasicCustomerForm = ({
  getBasicCustomerFormErrors,
  getBasicCustomerFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<BasicCustomerFormModel>({
    initialValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      url: initialValues?.url || '',
      email: initialValues?.email || '',
      postalAddress: initialValues?.postalAddress || null,
      billingAddress: initialValues?.billingAddress || null,
      priority: initialValues?.priority || null,
      externalId: initialValues?.externalId || '',
      registrationDate: initialValues?.registrationDate || new Date(),
      costCenter: initialValues.costCenter,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getBasicCustomerFormErrors) {
      getBasicCustomerFormErrors(formik.errors);
    }

    if (getBasicCustomerFormValues) {
      getBasicCustomerFormValues(formik.values);
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
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'Blake',
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
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g johndoe@example.com',
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
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: '49 17163 995801',
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
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: '49 17163 995801',
                label: 'Cost Center',
                name: 'costCenter',
                value: formik.values.costCenter,
                helperText: formik.errors.costCenter,
                error: !!formik.errors.costCenter,
                sx: {
                  mt: '0.5em',
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
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
          <Grid item md={4}>
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
          <Grid item md={4}>
            <Box display="flex" gap="1em">
              <MultipleSelectCheckmarks
                label="Priority"
                options={['A', 'B', 'C', 'NONE']}
                getSelectedValue={(item: string[]) =>
                  formik.setFieldValue('priority', item[0])
                }
                initialSelectedItems={
                  formik.values.priority ? [formik.values.priority] : ['NONE']
                }
                disableClearBtn
                multiple={false}
                containerStyles={{marginTop: '0.5em', width: '100%'}}
                formControlStyles={{width: '100%'}}
              />
            </Box>
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'Enter url',
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
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g 1234',
                label: 'Customer Number',
                name: 'externalId',
                value: formik.values.externalId,
                helperText:
                  formik.touched.externalId && formik.errors.externalId,
                error: !!formik.errors.externalId && formik.touched.externalId,
                sx: {
                  mt: '0.5em',
                },
                required: true,
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <DatePicker
              defaultDate={formik.values.registrationDate}
              getSelectedDate={(newValue) => {
                if (newValue)
                  formik.setFieldValue('registrationDate', newValue);
              }}
              textFieldProps={{
                label: 'Customer Since',
                placeholder: 'Select date',
                sx: {
                  mt: '0.5em',
                },
                ...defaultProps,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
