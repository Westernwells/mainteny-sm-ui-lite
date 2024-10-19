import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormikProps, getIn} from 'formik';
import {FormSelect} from 'components/form/FormSelect';
import {SeparateAddressFormModal} from 'models/unitForm';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Typography} from '@mui/material';

interface Props {
  formik: FormikProps<SeparateAddressFormModal>;
  title: string;
  type: 'beneficiaryAddress' | 'billingAddress';
  columnSettings?: {lg?: number; xs?: number; sm?: number; md?: number};
}

export const AddressForm = ({
  type,
  title,
  formik,
  columnSettings = {},
}: Props) => {
  const {lg = 3, md = 4, sm = 4, xs = 12} = columnSettings;
  const {t} = useTranslation();

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [
      formik.values.billingAddress?.component?.country,
      formik.values.beneficiaryAddress?.component?.country,
    ],
  );

  const addressObject =
    type === 'beneficiaryAddress'
      ? formik.values.beneficiaryAddress
      : formik.values.billingAddress;
  const inputNamePrefix = type;

  return (
    <Box sx={{mt: 3}} component="form">
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        {t(title)}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: '',
              label: 'Name',
              name: `${inputNamePrefix}.component.name`,
              value: addressObject?.component?.name ?? '',
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <AddressAutoComplete
            initialValue={
              addressObject?.component?.street || addressObject?.fullName || ''
            }
            initialAddress={addressObject}
            inputError={
              getIn(formik.errors, `${inputNamePrefix}.fullName`) &&
              getIn(formik.touched, `${inputNamePrefix}.fullName`)
                ? getIn(formik.errors, `${inputNamePrefix}.fullName`)
                : ''
            }
            handleBlur={formik.handleBlur}
            textFieldProps={{
              placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
              name: `${inputNamePrefix}.fullName`,
              label: 'Address line 1',
            }}
            allowMap
            getAddress={(address) => {
              formik.setValues({
                ...formik.values,
                [inputNamePrefix]: {
                  ...addressObject,
                  ...address,
                  fullName: address?.fullName as string,
                  component: {
                    ...address?.component,
                    name: addressObject?.component?.name,
                    moreInfo: addressObject?.component?.moreInfo,
                  },
                },
              });
            }}
            shortAddress
          />
        </Grid>
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: '',
              label: 'Address line 2',
              name: `${inputNamePrefix}.component.street2`,
              value: addressObject?.component?.street2 ?? '',
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: '',
              label: 'City',
              name: `${inputNamePrefix}.component.city`,
              required: true,
              value: addressObject?.component?.city ?? '',
              onChange: formik.handleChange,
            }}
          />
        </Grid>

        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: '',
              label: 'ZIP/Postal Code',
              name: `${inputNamePrefix}.component.postalCode`,
              value: addressObject?.component?.postalCode ?? '',
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
          />
        </Grid>

        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <FormSelect
            labelId="component.country"
            label="Country"
            options={countriesOptions}
            selectProps={{
              id: `${inputNamePrefix}.component.country`,
              name: `${inputNamePrefix}.component.country`,
              value: addressObject?.component?.country ?? '',
              multiple: false,
              onChange: formik.handleChange,
              notched: true,
            }}
            isCompanyTranslation
          />
        </Grid>

        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <FormSelect
            labelId={`${inputNamePrefix}.component.state`}
            label="State/Province/Region"
            options={statesByCountry(
              type === 'beneficiaryAddress'
                ? formik.values.beneficiaryAddress?.component?.country
                : addressObject?.component?.country,
            )}
            selectProps={{
              id: `${inputNamePrefix}.component.state`,
              name: `${inputNamePrefix}.component.state`,
              value: addressObject?.component?.state ?? '',
              multiple: false,
              onChange: formik.handleChange,
              notched: true,
              placeholder: '',
            }}
            isCompanyTranslation
          />
        </Grid>
        {type === 'billingAddress' && (
          <Grid item xs={xs} sm={sm} md={md} lg={lg}>
            <FormInput
              fieldProps={{
                size: 'small',
                placeholder: '',
                label: 'Additional info',
                name: `${inputNamePrefix}.component.moreInfo`,
                value: addressObject?.component?.moreInfo ?? '',
                onChange: formik.handleChange,
              }}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
