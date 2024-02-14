import React, {useState} from 'react';
import {FormikProps} from 'formik';
import {Email, Phone, RemoveRedEye} from '@mui/icons-material';
import {Grid, InputAdornment} from '@mui/material';
import Box from '@mui/material/Box';

import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import {SelectShift} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/SelectShift';
import {UserFormTypes} from './model';

interface Props {
  formik: FormikProps<UserFormTypes>;
  typeForm: 'edit' | 'create';
}

export const UserForm = ({formik, typeForm}: Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Box sx={{mt: '0.5em'}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
        <Grid item xs={12}>
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

        <Grid item xs={12}>
          {[
            {
              id: 'email',
              label: 'Email address',
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
        <Grid item xs={12}>
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
        <Grid item xs={12}>
          {[
            {
              id: 'employeeId',
              label: 'Employee ID',
              placeholder: 'e.g. 00001',
              value: formik.values.employeeId,
              helperText: formik.touched.employeeId && formik.errors.employeeId,
              error: !!formik.errors.employeeId && formik.touched.employeeId,
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
        <Grid item xs={12}>
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
            getAddress={(address) => formik.setFieldValue('address', address)}
          />
        </Grid>
        <Grid item xs={12}>
          {[
            {
              id: 'password',
              label: 'Password',
              placeholder: 'e.g. 13ofOhy65',
              type: isPasswordVisible ? 'text' : 'password',
              value: formik.values.password,
              InputProps: {
                endAdornment: (
                  <InputAdornment
                    position="end"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    sx={{cursor: 'pointer'}}>
                    <RemoveRedEye />
                  </InputAdornment>
                ),
              },
              helperText: formik.touched.password && formik.errors.password,
              error: !!formik.errors.password && formik.touched.password,
              required: typeForm === 'create' && true,
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

        <Grid item xs={12}>
          <SelectShift
            values={formik.values}
            setFieldValue={formik.setFieldValue}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
