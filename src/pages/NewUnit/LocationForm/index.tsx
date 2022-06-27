import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikValues, useFormik} from 'formik';
import {LocationFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect} from 'react';
import {PageCard} from 'components/PageCard';
import {useTranslation} from 'react-i18next';

interface Props {
  getLocationFormErrors?: (val: FormikErrors<LocationFormModel>) => void;
  getLocationFormValues?: (val: FormikValues) => void;
  initialValues?: LocationFormModel;
}

const validationSchema = Yup.object().shape({
  address: Yup.object().nullable().required('Address is required'),
});

export const LocationForm = ({
  getLocationFormErrors,
  getLocationFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<LocationFormModel>({
    initialValues: {
      address: initialValues?.address,
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

  const {t} = useTranslation();

  return (
    <PageCard
      headerLabel="Location Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item md={4}>
            <AddressAutoComplete
              initialValue={formik.values.address?.fullName || ''}
              inputError={
                formik.errors.address && formik.touched.address
                  ? formik.errors.address
                  : ''
              }
              handleBlur={formik.handleBlur}
              textFieldProps={{
                placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
                required: true,
              }}
              getAddress={(address) =>
                formik.setValues({
                  ...formik.values,
                  address,
                })
              }
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: t('e.g. A1 first floor'),
                label: t('Building'),
                name: 'building',
                value: formik.values.building,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: t('e.g. Residential'),
                label: t('Property Segment'),
                name: 'propertySegment',
                value: formik.values.propertySegment,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: t('e.g. Outside key box, pin: 0000'),
                label: t('Key Location'),
                name: 'keyLocation',
                value: formik.values.keyLocation,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: t('e.g. central parking lot'),
                label: t('Parking'),
                name: 'parking',
                value: formik.values.parking,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
