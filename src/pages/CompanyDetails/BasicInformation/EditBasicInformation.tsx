import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';

import {FormInput} from 'components/form/FormInput';
import {InputAdornment} from '@mui/material';
import {Phone} from '@mui/icons-material';
import {BasicInformationCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<BasicInformationCompanyFormModel>;
}

export const EditBasicInformation = ({formik}: Props) => {
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
            placeholder: 'e.g. Cable xyz',
            label: 'Name',
            name: 'name',
            helperText: formik.touched.name && formik.errors.name,
            error: !!formik.errors.name && formik.touched.name,
            required: true,
            value: formik.values.name,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g johndoe@example.com',
            label: 'Email',
            name: 'email',
            required: true,
            helperText: formik.touched.email && formik.errors.email,
            error: !!formik.errors.email && formik.touched.email,
            value: formik.values.email,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. +49 173 12345678',
            label: 'Phone',
            name: 'phone',
            helperText: formik.touched.phone && formik.errors.phone,
            error: !!formik.errors.phone && formik.touched.phone,
            value: formik.values.phone,
            sx: {mb: '1em'},
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
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. www.yourcompany.com',
            label: 'Website',
            name: 'url',
            value: formik.values.url,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};
