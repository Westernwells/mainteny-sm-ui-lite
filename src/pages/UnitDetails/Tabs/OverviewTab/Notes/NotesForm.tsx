import React from 'react';
import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {NotesFormModel} from 'models/unitForm';

interface Props {
  formik: FormikProps<NotesFormModel>;
}

export const NotesForm = ({formik}: Props) => (
  <Box>
    <FormInput
      containerStyles={{mt: '0.5em'}}
      props={{
        size: 'small',
        placeholder: 'Enter Note',
        label: 'Note',
        name: 'note',
        value: formik.values.note,
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        multiline: true,
        required: true,
        error: !!(formik.touched.note && formik.errors.note),
        helperText: formik.touched.note && formik.errors.note,
        minRows: 3,
      }}
    />
  </Box>
);
