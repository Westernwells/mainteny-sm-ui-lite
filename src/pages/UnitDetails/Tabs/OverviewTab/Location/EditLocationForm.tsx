import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {LocationFormModel} from 'models/unitForm';

interface Props {
  formik: FormikProps<LocationFormModel>;
}

export const EditLocationForm = ({formik}: Props) => (
  <Box sx={{mt: '0.5em'}} component="form">
    <AddressAutoComplete
      initialValue={formik.values.address?.fullName || ''}
      inputError={formik.errors.address}
      handleBlur={formik.handleBlur}
      textFieldProps={{
        placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
      }}
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
        placeholder: 'e.g. A1 first floor',
        label: 'Building',
        name: 'building',
        value: formik.values.building,
        onChange: formik.handleChange,
      }}
    />
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

    <FormInput
      props={{
        size: 'small',
        placeholder: 'e.g. Outside key box, pin: 0000',
        label: 'Key Location',
        name: 'keyLocation',
        value: formik.values.keyLocation,
        onChange: formik.handleChange,
      }}
    />
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
  </Box>
);
