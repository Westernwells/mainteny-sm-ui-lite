import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {DescriptionFormModel} from './model';

interface Props {
  formik: FormikProps<DescriptionFormModel>;
}

export const DescriptionForm = ({formik}: Props) => (
  <Box>
    <FormInput
      containerStyles={{mt: '0.5em'}}
      props={{
        size: 'small',
        placeholder: 'Enter description',
        label: 'Description',
        name: 'description',
        value: formik.values.description,
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        multiline: true,
        required: true,
        error: !!(formik.touched.description && formik.errors.description),
        helperText: formik.touched.description && formik.errors.description,
        minRows: 3,
      }}
    />
  </Box>
);
