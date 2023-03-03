import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {useFormikContext} from 'formik';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import {Email, Phone} from '@mui/icons-material';

import {FormInput} from 'components/form/FormInput';
import {Dialog} from 'components/Dialog';
import {DatePicker} from 'components/DatePicker';
import {CustomerEditForm} from './model';
import {SelectPostalAddress} from './SelectPostalAddress';
import {SelectBillingAddress} from './SelectBillingAddress';
import {SelectPriority} from './SelectPriority';

interface Props {
  openDialog: boolean;
  onClose: () => void;
}

export const EditCustomerForm = ({openDialog, onClose}: Props) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    submitForm,
    setValues,
  } = useFormikContext<CustomerEditForm>();
  const {t} = useTranslation();

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Dialog
      title="Edit Basic Information"
      onCancel={onClose}
      onSave={submitForm}
      disableSaveBtn={!!Object.keys(errors).length}
      dialogProps={{
        maxWidth: 'md',
        open: openDialog || false,
      }}>
      <Grid container spacing={2}>
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'Blake',
              label: 'Name',
              name: 'name',
              value: values.name,
              helperText: touched.name && errors.name,
              error: !!errors.name && touched.name,
              required: true,
              sx: {
                mt: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g johndoe@example.com',
              label: 'Email',
              name: 'email',
              value: values.email,
              helperText: touched.email && errors.email,
              error: !!errors.email && touched.email,
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
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'Enter url',
              label: 'Website / URL',
              name: 'url',
              value: values.url,
              helperText: touched.url && errors.url,
              error: !!errors.url && touched.url,
              sx: {
                mt: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={6}>
          <SelectPostalAddress />
        </Grid>
        <Grid item md={6}>
          <SelectBillingAddress />
        </Grid>
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g johndoe@example.com',
              label: 'Billing email address',
              name: 'billingEmail',
              value: values.billingEmail,
              helperText: touched.billingEmail && errors.billingEmail,
              error: !!errors.billingEmail && touched.billingEmail,
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
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: '49 17163 995801',
              label: 'Phone',
              name: 'phone',
              value: values.phone,
              helperText: touched.phone && errors.phone,
              error: !!errors.phone && touched.phone,
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
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: '49 17163 995801',
              label: '2nd Phone',
              name: 'secondaryPhoneNumber',
              value: values.secondaryPhoneNumber,
              helperText:
                touched.secondaryPhoneNumber && errors.secondaryPhoneNumber,
              error:
                !!errors.secondaryPhoneNumber && touched.secondaryPhoneNumber,
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

        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g 1234',
              label: 'Customer Number',
              name: 'externalId',
              value: values.externalId,
              helperText: touched.externalId && errors.externalId,
              error: !!errors.externalId && touched.externalId,
              required: true,
              sx: {
                mt: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item md={6}>
          <DatePicker
            containerStyles={{mr: '1em', width: '100%'}}
            getSelectedDate={(date) => {
              if (date) {
                setValues({
                  ...values,
                  registrationDate: format(date, 'yyyy-MM-dd'),
                });
              }
            }}
            disableMask
            textFieldProps={{
              label: t('Customer Since'),
              name: 'registrationDate',
              helperText:
                errors.registrationDate && touched.registrationDate
                  ? errors.registrationDate
                  : '',
              error: !!(touched.registrationDate && errors.registrationDate),
              sx: {width: '100%'},
              onBlur: handleBlur,
            }}
          />
        </Grid>

        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g 000 000 000',
              label: 'Cost center',
              name: 'costCenter',
              value: values.costCenter,
              helperText: touched.costCenter && errors.costCenter,
              error: !!errors.costCenter && touched.costCenter,
              required: true,
              sx: {
                mt: '0.5em',
              },
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item md={6}>
          <SelectPriority />
        </Grid>
      </Grid>
    </Dialog>
  );
};
