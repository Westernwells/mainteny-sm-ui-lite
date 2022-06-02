/* eslint-disable */

import {Box} from '@mui/system';
import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {ServiceFormModel} from '../models';

interface Props {
  formik: FormikProps<ServiceFormModel>;
}

export const EditServiceForm = ({formik}: Props) => (
  <Box sx={{mt: '0.5em'}} component="form">
    <DatePicker
      defaultDate={formik.values.lastVisitDate}
      fieldStyles={{width: '100%'}}
      inputError={
        formik.errors.lastVisitDate && formik.touched.lastVisitDate
          ? formik.errors.lastVisitDate
          : ''
      }
      // containerStyles={{mr: '1em', width: '100%'}}
      // minDate={startOfDay(new Date())}
      handleBlur={formik.handleBlur}
      getSelectedDate={(date) => formik.setFieldValue('lastVisitDate', date)}
      label="Last Visit"
      inputName="lastVisitDate"
    />
    {/* <FormInput
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
    /> */}
  </Box>
);
