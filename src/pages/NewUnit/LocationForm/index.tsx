import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikValues, getIn, useFormik} from 'formik';
import {LocationFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useCallback, useEffect} from 'react';
import {PageCard} from 'components/PageCard';
import {useTranslation} from 'react-i18next';
import {FormSelect} from 'components/form/FormSelect';
import {countriesOptions, getStatesByCountry} from 'utils/countries';

interface Props {
  getLocationFormErrors?: (val: FormikErrors<LocationFormModel>) => void;
  getLocationFormValues?: (val: FormikValues) => void;
  initialValues?: LocationFormModel;
}

const validationSchema = Yup.object().shape({
  address: Yup.object()
    .nullable()
    .shape({
      fullName: Yup.string().nullable().required('Address is required'),
      component: Yup.object().shape({
        country: Yup.string().required('Country is required'),
        state: Yup.string().required('State is required'),
        city: Yup.string().required('City is required'),
      }),
    }),
});

export const LocationForm = ({
  getLocationFormErrors,
  getLocationFormValues,
  initialValues,
}: Props) => {
  const {t} = useTranslation();
  const formik = useFormik<LocationFormModel>({
    initialValues: {
      address: initialValues?.address || {
        fullName: '',
      },
      building: initialValues?.building,
      propertySegment: initialValues?.propertySegment,
      keyLocation: initialValues?.keyLocation,
      parking: initialValues?.parking,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getLocationFormErrors) {
      getLocationFormErrors(formik.errors);
    }

    if (getLocationFormValues) {
      getLocationFormValues(formik.values);
    }
  }, [formik]);

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [formik.values.address?.component?.country],
  );

  return (
    <PageCard
      headerLabel="Location Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <AddressAutoComplete
              initialValue={formik.values.address?.fullName || ''}
              initialAddress={formik.values.address}
              inputError={
                getIn(formik.errors, 'address.fullName') &&
                getIn(formik.touched, 'address.fullName')
                  ? getIn(formik.errors, 'address.fullName')
                  : ''
              }
              handleBlur={formik.handleBlur}
              textFieldProps={{
                placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
                name: 'address.fullName',
              }}
              allowMap
              getAddress={(address) => {
                formik.setValues({
                  ...formik.values,
                  address: address
                    ? {
                        ...address,
                        fullName: address?.fullName as string,
                      }
                    : undefined,
                });
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <FormInput
              props={{
                size: 'small',
                placeholder: '',
                label: 'Address line 2',
                name: 'address.component.street2',
                // required: true,
                value: formik.values.address?.component?.street2 ?? '',
                onChange: formik.handleChange,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={3}>
            <FormInput
              props={{
                size: 'small',
                placeholder: '',
                label: 'City',
                name: 'address.component.city',
                required: true,
                value: formik.values.address?.component?.city ?? '',
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3} md={3}>
            <FormInput
              props={{
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

          <Grid item xs={12} sm={3} md={3}>
            <FormSelect
              labelId="address.component.country"
              label="Country"
              options={countriesOptions}
              selectProps={{
                id: 'address.component.country',
                name: 'address.component.country',
                value: formik.values.address?.component?.country ?? '',
                multiple: false,
                onChange: formik.handleChange,
                notched: true,
              }}
              required
              isCompanyTranslation
            />
          </Grid>

          <Grid item xs={12} sm={3} md={3}>
            <FormSelect
              labelId="address.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                formik.values.address?.component?.country,
              )}
              selectProps={{
                id: 'address.component.state',
                name: 'address.component.state',
                value: formik.values.address?.component?.state ?? '',
                multiple: false,
                onChange: formik.handleChange,
                notched: true,
                placeholder: '',
              }}
              required
              isCompanyTranslation
            />
          </Grid>
        </Grid>
        <Grid sx={{mt: '3em'}} container spacing={2}>
          <Grid item xs={12} sm={4} md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. A1 first floor',
                label: 'Building',
                name: 'building',
                value: formik.values.building,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. Residential',
                label: 'Property Segment',
                name: 'propertySegment',
                value: formik.values.propertySegment,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. central parking lot',
                label: 'Parking',
                name: 'parking',
                value: formik.values.parking,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. Outside key box, pin: 0000',
                label: 'Key Location',
                name: 'keyLocation',
                value: formik.values.keyLocation,
                onChange: formik.handleChange,
                multiline: true,
                rows: 4,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
