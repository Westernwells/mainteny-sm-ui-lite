import {useCallback} from 'react';
import {FormikProps, getIn} from 'formik';
import Grid from '@mui/material/Grid';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {AddressRecord} from 'models/misc';
import {useTranslation} from 'react-i18next';
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
  const formErrors = getIn(formik.errors, address);
  const formTouched = getIn(formik.touched, address);

  const {t} = useTranslation();

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
        <AddressAutoComplete
          initialValue={
            formik.values[address]?.component?.street ||
            formik.values[address]?.fullName ||
            ''
          }
          initialAddress={formik.values[address] as AddressRecord | undefined}
          inputError={
            getIn(formik.errors, 'address.fullName') &&
            getIn(formik.touched, 'address.fullName')
              ? getIn(formik.errors, 'address.fullName')
              : ''
          }
          handleBlur={formik.handleBlur}
          textFieldProps={{
            id: 'address.fullName',
            placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
            name: 'address.fullName',
            label: 'Address line 1',
            ...(address === 'billingAddress' && {
              required: true,
              helperText:
                formErrors?.fullName &&
                getIn(formik.touched, 'address.fullName')
                  ? formErrors?.fullName
                  : '',
              error:
                !!formErrors?.fullName &&
                getIn(formik.touched, 'address.fullName'),
            }),
            onBlur: formik.handleBlur,
          }}
          allowMap
          getAddress={(componentAddress) => {
            formik.setValues({
              ...formik.values,
              [address]: componentAddress
                ? {
                    ...componentAddress,
                    fullName: componentAddress?.fullName as string,
                  }
                : undefined,
            });
          }}
          shortAddress
        />
      </Grid>
      <Grid item md={6}>
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
      <Grid item md={3.5}>
        <FormInput
          fieldProps={{
            id: 'city',
            size: 'small',
            label: 'City',
            name: `${address}.component.city`,
            value: value?.component?.city ?? '',
            ...defaultProps,
            ...(address === 'billingAddress' && {
              required: true,
              helperText:
                formErrors?.component?.city && formTouched?.component?.city
                  ? t(`${formErrors?.component?.city}`)
                  : '',
              error:
                !!formErrors?.component?.city && formTouched?.component?.city,
              onBlur: formik.handleBlur,
            }),
          }}
        />
      </Grid>
      <Grid item md={2.5}>
        <FormInput
          fieldProps={{
            id: 'postalCode',
            size: 'small',
            label: 'ZIP/Postal Code',
            name: `${address}.component.postalCode`,
            value: value?.component?.postalCode ?? '',
            ...defaultProps,
            ...(address === 'billingAddress' && {
              required: true,
              helperText:
                formErrors?.component?.postalCode &&
                formTouched?.component?.postalCode
                  ? t(`${formErrors?.component?.postalCode}`)
                  : '',
              error:
                !!formErrors?.component?.postalCode &&
                formTouched?.component?.postalCode,
            }),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>
      <Grid item md={3}>
        <FormSelect
          labelId={`${address}.component.country`}
          label="Country"
          options={countriesOptions}
          errorText={
            formErrors?.component?.country && formTouched?.component?.country
              ? t(`${formErrors?.component?.country}`)
              : ''
          }
          selectProps={{
            id: 'component.country',
            name: `${address}.component.country`,
            value: value?.component?.country ?? '',
            multiple: false,
            onChange: handleChange,
            ...(address === 'billingAddress' && {
              required: true,

              error:
                !!formErrors?.component?.country &&
                formTouched?.component?.country,
            }),
            onBlur: formik.handleBlur,
          }}
          required={address === 'billingAddress'}
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
