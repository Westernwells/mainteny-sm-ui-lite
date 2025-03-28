import React, {useCallback} from 'react';
import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {QuotationFormData} from 'models/quotation';
import {SelectChangeEvent} from '@mui/material';
import {FieldPath, UseFormGetValues, UseFormSetValue} from 'react-hook-form';

export const EditCustomerForm = ({
  formik,
  setValue,
  getValues,
  address,
}: {
  formik?: FormikProps<QuotationFormData>;
  setValue?: UseFormSetValue<QuotationFormData>;
  getValues?: UseFormGetValues<QuotationFormData>;
  address: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress';
}) => {
  const value = formik ? formik.values[address] : getValues?.()[address];
  const handleChange = formik
    ? formik.handleChange
    : (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | {name?: string; value: any}
        >,
      ) => {
        if (e.target.name)
          setValue?.(
            e.target.name as FieldPath<QuotationFormData>,
            e.target.value,
          );
      };

  const handleSelectChange = formik
    ? formik.handleChange
    : (e: SelectChangeEvent<string | string[]>) => {
        if (e.target.name)
          setValue?.(
            e.target.name as FieldPath<QuotationFormData>,
            e.target.value as string,
          );
      };

  const handleBlur = formik ? formik.handleBlur : () => {};

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [value?.component?.country],
  );

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Grid container spacing={3}>
      <Grid item md={3}>
        <FormInput
          fieldProps={{
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
          fieldProps={{
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
          fieldProps={{
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
          fieldProps={{
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
          fieldProps={{
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
            onChange: handleSelectChange,
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
            onChange: handleSelectChange,
          }}
          isCompanyTranslation
        />
      </Grid>
      {address === 'billingAddress' && (
        <Grid item md={3}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Additional Information',
              name: `${address}.component.moreInfo`,
              value: value?.component?.moreInfo ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};
