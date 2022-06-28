import React from 'react';
import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {NotesFormModel} from 'models/unitForm';
import {useTranslation} from 'react-i18next';

interface Props {
  formik: FormikProps<NotesFormModel>;
}

export const NotesForm = ({formik}: Props) => {
  const {t} = useTranslation();
  return (
    <Box>
      <FormInput
        props={{
          size: 'small',
          placeholder: t('Enter Note'),
          label: t('Note'),
          name: 'note',
          value: formik.values.note,
          onChange: formik.handleChange,
          multiline: true,
          minRows: 3,
        }}
      />
    </Box>
  );
};
