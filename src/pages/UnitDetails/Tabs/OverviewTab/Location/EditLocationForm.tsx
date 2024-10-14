import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import {FormikProps, getIn} from 'formik';
import {LocationFormModel, SeparateAddressFormModal} from 'models/unitForm';
import Grid from '@mui/material/Grid';
import {useCallback} from 'react';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormSelect} from 'components/form/FormSelect';
import {CustomerAutoComplete} from 'components/CustomerAutocomplete';
import {useTranslation} from 'react-i18next';
import {PropertyOwnerView} from 'models/propertyManager';
import InputAdornment from '@mui/material/InputAdornment';
import {getCurrencySymbol, useCurrentCurrency} from 'utils/currency';
import {Box} from '@mui/system';
import {SeparateInvoiceAddress} from 'pages/NewUnit/LocationForm/SeparateInvoiceAddress';

interface Props {
  formik: FormikProps<LocationFormModel>;
  separateAddressFormik: FormikProps<SeparateAddressFormModal>;
  initialCustomer?: PropertyOwnerView;
  isSeparateAddressEnabled: boolean;
  setIsSeparateAddressEnabled: (newBol: boolean) => void;
}

export const EditLocationForm = ({
  formik,
  separateAddressFormik,
  initialCustomer,
  isSeparateAddressEnabled,
  setIsSeparateAddressEnabled,
}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [formik.values.address?.component?.country],
  );

  const customer =
    initialCustomer?.meta?.state === 'ACTIVE' ? initialCustomer : null;
  return (
    <Box>
      <Grid container component="form" rowSpacing={3} columnSpacing={2}>
        <Grid item xs={12}>
          <CustomerAutoComplete
            getCustomer={(value) => {
              formik.setValues({
                ...formik.values,
                propertyOwnerId: value ? value.id : '',
              });
              if (value) {
                formik.setFieldValue('propertyOwnerId', value.id);
              }
            }}
            initialValue={customer}
            textFieldProps={{
              required: true,
              error: !!(
                formik.errors.propertyOwnerId && formik.touched.propertyOwnerId
              ),
              helperText:
                formik.errors.propertyOwnerId && formik.touched.propertyOwnerId
                  ? t(formik.errors.propertyOwnerId)
                  : '',
              label: t('Customer Name'),
              name: 'propertyOwnerId',
              onBlur: formik.handleBlur,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AddressAutoComplete
            initialValue={formik.values.address?.component?.street || ''}
            initialAddress={formik.values.address}
            inputError={
              getIn(formik.errors, 'address.fullName') &&
              getIn(formik.touched, 'address.fullName')
                ? getIn(formik.errors, 'address.fullName')
                : ''
            }
            handleBlur={formik.handleBlur}
            textFieldProps={{
              placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
              required: true,
              name: 'address.fullName',
              label: 'Address line 1',
            }}
            allowMap
            getAddress={(address) => {
              formik.setValues({
                ...formik.values,
                address: address
                  ? {
                      ...address,
                      component: {
                        ...address.component,
                        street2:
                          address.component?.street2 !== ''
                            ? address.component?.street2
                            : formik.values.address?.component?.street2,
                      },
                      fullName: address?.fullName as string,
                    }
                  : undefined,
              });
            }}
            shortAddress
          />
        </Grid>
        <Grid item xs={12}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: '',
              label: 'Address line 2',
              name: 'address.component.street2',
              value: formik.values.address?.component?.street2 ?? '',
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInput
            fieldProps={{
              required: true,
              size: 'small',
              placeholder: '',
              label: 'City',
              name: 'address.component.city',
              value: formik.values.address?.component?.city ?? '',
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: '',
              label: 'ZIP/Postal Code',
              name: 'address.component.postalCode',

              value: formik.values.address?.component?.postalCode ?? '',
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormSelect
            labelId="address.component.state"
            label="State/Province/Region"
            options={statesByCountry(formik.values.address?.component?.country)}
            selectProps={{
              id: 'address.component.state',
              name: 'address.component.state',
              value: formik.values.address?.component?.state ?? '',
              multiple: false,
              onChange: formik.handleChange,
            }}
            isCompanyTranslation
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormSelect
            required
            labelId="address.component.country"
            label="Country"
            options={countriesOptions}
            selectProps={{
              id: 'address.component.country',
              name: 'address.component.country',
              value: formik.values.address?.component?.country ?? '',
              multiple: false,
              onChange: formik.handleChange,
            }}
            isCompanyTranslation
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: 'e.g. A1 first floor',
              label: 'Building',
              name: 'building',
              value: formik.values.building,
              onChange: formik.handleChange,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: 'e.g. Residential',
              label: 'Property Segment',
              name: 'propertySegment',
              value: formik.values.propertySegment,
              onChange: formik.handleChange,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: 'e.g. central parking lot',
              label: 'Parking',
              name: 'parking',
              value: formik.values.parking,
              onChange: formik.handleChange,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            fieldProps={{
              size: 'small',
              placeholder: 'e.g. Outside key box, pin: 0000',
              label: 'Key Location',
              name: 'keyLocation',
              value: formik.values.keyLocation,
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormInput
            fieldProps={{
              type: 'number',
              size: 'small',
              placeholder: 'e.g. 5',
              label: 'Distance (km)',
              name: 'distance',
              value: formik.values.distance,
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormInput
            fieldProps={{
              type: 'number',
              size: 'small',
              placeholder: 'e.g. 10 min',
              label: 'Travel time (min)',
              name: 'travelTime',
              value: formik.values.travelTime,
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormInput
            inputType="currency"
            fieldProps={{
              size: 'small',
              placeholder: 'e.g. 150',
              label: 'Travel fee',
              type: 'number',
              inputProps: {
                min: 0,
                defaultValue: formik.values.travelFee,
                name: 'travelFee',
                value: formik.values.travelFee,
                onChange: formik.handleChange,
              },
              InputProps: {
                sx: {alignItems: 'center'},
                startAdornment: (
                  <InputAdornment position="end" sx={{marginRight: '0.3rem'}}>
                    {getCurrencySymbol[currentCurrency.code]}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
      </Grid>
      <SeparateInvoiceAddress
        isSeparateAddressEnabled={isSeparateAddressEnabled}
        setIsSeparateAddressEnabled={(newBol) =>
          setIsSeparateAddressEnabled(newBol)
        }
        formik={separateAddressFormik}
        columnSettings={{xs: 6, sm: 4, md: 4, lg: 4}}
      />
    </Box>
  );
};
