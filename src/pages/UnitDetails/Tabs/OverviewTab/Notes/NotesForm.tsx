import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import React from 'react';
import {NotesFormModel} from '../models';

interface Props {
  formik: FormikProps<NotesFormModel>;
}

export const NotesForm = ({formik}: Props) => (
  <Box>
    <FormInput
      props={{
        size: 'small',
        placeholder: 'Enter Note',
        label: 'Note',
        name: 'note',
        value: formik.values.note,
        onChange: formik.handleChange,
        multiline: true,
      }}
    />
  </Box>
);
