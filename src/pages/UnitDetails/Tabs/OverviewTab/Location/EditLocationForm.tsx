import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {LocationForm} from './models';

interface Props {
  formik: FormikProps<LocationForm>;
}

export const EditLocationForm = ({formik}: Props) => (
  <Box sx={{mt: '0.5em'}} component="form">
    <AddressAutoComplete
      initialValue={formik.values.address?.fullName || ''}
      inputError={formik.errors.address}
      handleBlur={formik.handleBlur}
      getAddress={(address) =>
        formik.setValues({
          ...formik.values,
          address,
        })
      }
    />
    <FormInput
      props={{
        size: 'small',
        placeholder: 'Enter building location',
        label: 'Building',
        name: 'building',
        value: formik.values.building,
        onChange: formik.handleChange,
      }}
    />
    <FormInput
      props={{
        size: 'small',
        placeholder: 'Enter Property segment',
        label: 'Property Segment',
        name: 'propertySegment',
        value: formik.values.propertySegment,
        onChange: formik.handleChange,
      }}
    />

    <FormInput
      props={{
        size: 'small',
        placeholder: 'Enter key location ',
        label: 'Key Location',
        name: 'keyLocation',
        value: formik.values.keyLocation,
        onChange: formik.handleChange,
      }}
    />
    <FormInput
      props={{
        size: 'small',
        placeholder: 'Enter where to park',
        label: 'Parking',
        name: 'parking',
        value: formik.values.parking,
        onChange: formik.handleChange,
      }}
    />
  </Box>
);
