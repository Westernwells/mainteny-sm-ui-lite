import {useCallback} from 'react';
import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {BasicInformationCompanyFormModel} from './model';

export const EditAddress = ({
  formik,
  address,
}: {
  formik: FormikProps<BasicInformationCompanyFormModel>;
  address: 'billingAddress' | 'businessAddress' | 'postalAddress';
}) => {
  const {values, handleChange, handleBlur} = formik;
  const value = values[address];

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [value?.component?.country],
  );

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid item md={6}>
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
      <Grid item md={6}>
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
      <Grid item md={3.5}>
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
      <Grid item md={2.5}>
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
