import {useEffect} from 'react';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import {InputAdornment} from '@mui/material';
import Email from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

import {PageCard} from 'components/PageCard';
import {BasicEmployeeFormModel} from 'models/employee';
import {FormInput} from 'components/form/FormInput';
import {AddressAutoComplete} from 'components/AddressAutoComplete';

interface Props {
  getBasicEmployeeFormErrors?: (
    val: FormikErrors<BasicEmployeeFormModel>,
  ) => void;
  getBasicEmployeeFormValues?: (val: BasicEmployeeFormModel) => void;
  initialValues?: BasicEmployeeFormModel;
}

export const phoneValidationRE =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  team: Yup.string().matches(/^[0-9]+$/, 'Team is not valid'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(phoneValidationRE, 'Phone number is not valid'),
  address: Yup.object().required(),
});

export const BasicEmployeeForm = ({
  getBasicEmployeeFormErrors,
  getBasicEmployeeFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<BasicEmployeeFormModel>({
    initialValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      phone: initialValues?.phone || '',
      address: initialValues?.address || null,
      email: initialValues?.email || '',
      employeeId: initialValues?.employeeId || '',
      team: initialValues?.team || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getBasicEmployeeFormErrors) {
      getBasicEmployeeFormErrors(formik.errors);
    }

    if (getBasicEmployeeFormValues) {
      getBasicEmployeeFormValues(formik.values);
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
            <Box display="flex" gap="1em" marginBottom="1em">
              {[
                {
                  id: 'firstName',
                  label: 'First Name',
                  placeholder: 'e.g. John',
                  value: formik.values.firstName,
                  helperText:
                    formik.touched.firstName && formik.errors.firstName,
                  error: !!formik.errors.firstName && formik.touched.firstName,
                  required: true,
                },
                {
                  id: 'lastName',
                  label: 'Last Name',
                  placeholder: 'e.g. Meier',
                  value: formik.values.lastName,
                  helperText: formik.touched.lastName && formik.errors.lastName,
                  error: !!formik.errors.lastName && formik.touched.lastName,
                  required: true,
                },
              ].map((item, index) => (
                <FormInput
                  key={index}
                  props={{
                    ...item,
                    ...defaultProps,
                  }}
                />
              ))}
            </Box>
            <Box display="flex" gap="1em" marginBottom="1em">
              <AddressAutoComplete
                initialValue={formik.values.address?.fullName || ''}
                inputError={
                  formik.errors.address && formik.touched.address
                    ? formik.errors.address
                    : ''
                }
                handleBlur={formik.handleBlur}
                textFieldProps={{
                  InputLabelProps: {shrink: true},
                  placeholder: 'e.g. Karl-Liebknecht-Str. 32, 10178 Berlin',
                  required: true,
                }}
                getAddress={(address) =>
                  formik.setFieldValue('address', address)
                }
              />
            </Box>
          </Grid>
          <Grid item md={8}>
            <Box display="flex" gap="1em" marginBottom="1em">
              {[
                {
                  id: 'phone',
                  label: 'Phone',
                  placeholder: 'e.g. +49 173 12345678',
                  value: formik.values.phone,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start"> + </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  },
                  helperText: formik.touched.phone && formik.errors.phone,
                  error: !!formik.errors.phone && formik.touched.phone,
                  required: true,
                },
                {
                  id: 'email',
                  label: 'Email',
                  placeholder: 'e.g johndoe@example.com',
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Email />
                      </InputAdornment>
                    ),
                  },
                  value: formik.values.email,
                  helperText: formik.touched.email && formik.errors.email,
                  error: !!formik.errors.email && formik.touched.email,
                  required: true,
                },
              ].map((item, index) => (
                <FormInput
                  key={index}
                  props={{
                    ...item,
                    ...defaultProps,
                  }}
                />
              ))}
            </Box>
            <Box display="flex" gap="1em">
              {[
                {
                  id: 'team',
                  label: 'Team',
                  placeholder: 'e.g 2',
                  value: formik.values.team,
                  helperText: formik.touched.team && formik.errors.team,
                  error: !!formik.errors.team && formik.touched.team,
                },
                {
                  id: 'employeeId',
                  label: 'Employee ID',
                  placeholder: 'e.g. 00001',
                  value: formik.values.employeeId,
                  helperText:
                    formik.touched.employeeId && formik.errors.employeeId,
                  error:
                    !!formik.errors.employeeId && formik.touched.employeeId,
                },
              ].map((item, index) => (
                <FormInput
                  key={index}
                  props={{
                    ...item,
                    ...defaultProps,
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
