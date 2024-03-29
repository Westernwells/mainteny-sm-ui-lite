import {useCallback, useEffect} from 'react';
import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';

import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {InvoiceFormData} from 'models/invoice';

export const EditCustomerForm = ({
  formik,
  address,
  customerName,
}: {
  formik: FormikProps<InvoiceFormData>;
  address: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress';
  customerName?: string;
}) => {
  const {values, handleChange, handleBlur} = formik;
  const value = values[address];

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [value?.component?.country],
  );

  // populate name field with customer name by default if not set
  useEffect(() => {
    if (!value?.component?.name && customerName) {
      formik.setFieldValue(`${address}.component.name`, customerName);
    }
  }, []);

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Grid container spacing={3}>
      <Grid item md={3}>
        <FormInput
          props={{
            size: 'small',
            label: 'Name',
            name: `${address}.component.name`,
            value: value?.component?.name ?? '',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          props={{
            size: 'small',
            label: 'Address line 1',
            name: `${address}.component.street`,
            value: value?.component?.street ?? '',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          props={{
            size: 'small',
            label: 'Address line 2',
            name: `${address}.component.street2`,
            value: value?.component?.street2 ?? '',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={3}>
        <FormInput
          props={{
            size: 'small',
            label: 'City',
            name: `${address}.component.city`,
            value: value?.component?.city ?? '',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={3}>
        <FormInput
          props={{
            size: 'small',
            label: 'ZIP/Postal Code',
            name: `${address}.component.postalCode`,
            value: value?.component?.postalCode ?? '',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={3}>
        <FormSelect
          labelId={`${address}.component.country`}
          label="Country"
          options={countriesOptions}
          selectProps={{
            id: 'component.country',
            name: `${address}.component.country`,
            value: value?.component?.country ?? '',
            multiple: false,
            onChange: handleChange,
          }}
          isCompanyTranslation
        />
      </Grid>
      <Grid item md={3}>
        <FormSelect
          labelId={`${address}.component.state`}
          label="State/Province/Region"
          options={statesByCountry(value?.component?.country)}
          selectProps={{
            id: 'component.state',
            name: `${address}.component.state`,
            value: value?.component?.state ?? '',
            multiple: false,
            onChange: handleChange,
          }}
          isCompanyTranslation
        />
      </Grid>
    </Grid>
  );
};
