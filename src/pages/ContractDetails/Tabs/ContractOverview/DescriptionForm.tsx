import Box from '@mui/material/Box';
import {FormikProps} from 'formik';
import {FormInput} from 'components/form/FormInput';
import {ContractUpdateRequest} from 'models/contract';

interface Props {
  formik: FormikProps<ContractUpdateRequest>;
}

export const DescriptionForm = ({formik}: Props) => (
  <Box>
    <FormInput
      containerStyles={{mt: '0.5em'}}
      fieldProps={{
        size: 'medium',
        label: 'Description',
        name: 'description',
        value: formik.values.description,
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        multiline: true,
        required: true,
        error: !!(formik.touched.description && formik.errors.description),
        helperText: formik.touched.description && formik.errors.description,
        minRows: 5,
      }}
    />
  </Box>
);
