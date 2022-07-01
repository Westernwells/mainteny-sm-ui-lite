import React from 'react';
import {FormikProps} from 'formik';
import {Email, Phone} from '@mui/icons-material';
import {FormControl, Grid, InputAdornment} from '@mui/material';
import Box from '@mui/material/Box';

import {FormInput} from 'components/form/FormInput';
import {ContactFormModel} from 'models/contacts';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {convertToText} from 'utils/utils';

interface Props {
  formik: FormikProps<ContactFormModel>;
}

export const EditContactForm = ({formik}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Box sx={{mt: '0.5em'}}>
      <Grid container spacing={2}>
        <Grid item md={3}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g. John',
              label: 'First Name',
              name: 'firstName',
              value: formik.values.firstName,
              helperText: formik.touched.firstName && formik.errors.firstName,
              error: !!formik.errors.firstName && formik.touched.firstName,
              required: true,
              sx: {
                mb: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={3}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g. Meier',
              label: 'Last Name',
              name: 'lastName',
              value: formik.values.lastName,
              helperText: formik.touched.lastName && formik.errors.lastName,
              error: !!formik.errors.lastName && formik.touched.lastName,
              required: true,
              sx: {
                mb: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={6}>
          <FormControl fullWidth>
            <MultipleSelectCheckmarks
              label="Role"
              options={[
                'Facility Manager',
                'Property Manager',
                'Contact Person',
                'Asset Owner',
              ]}
              getSelectedValue={(item: string[]) =>
                formik.setFieldValue('roles', item[0])
              }
              initialSelectedItems={
                formik.values.roles ? [convertToText(formik.values.roles)] : []
              }
              required
              multiple={false}
              containerStyles={{width: '100%'}}
              formControlStyles={{width: '100%'}}
              disableClearBtn
            />
          </FormControl>
        </Grid>
        <Grid item md={6}>
          {[
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
        </Grid>
        <Grid item md={6}>
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
                    <Phone />
                  </InputAdornment>
                ),
              },
              helperText: formik.touched.phone && formik.errors.phone,
              error: !!formik.errors.phone && formik.touched.phone,
              required: false,
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
        </Grid>
      </Grid>
    </Box>
  );
};
