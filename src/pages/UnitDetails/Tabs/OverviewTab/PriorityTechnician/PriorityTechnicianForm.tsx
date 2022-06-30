import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {TechnicianAutoComplete} from 'components/TechnicianAutoComplete';
import {FormikProps} from 'formik';
import {ElevatorAssignmentSimpleView} from 'models/elevator';
import {PriorityTechnicianFormModel} from 'models/unitForm';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  formik: FormikProps<PriorityTechnicianFormModel>;
  activeTechnician?: ElevatorAssignmentSimpleView;
  disableAutoComplete?: boolean;
}

export const PriorityTechnicianForm = ({
  formik,
  activeTechnician,
  disableAutoComplete,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Box sx={{mt: '0.5em'}}>
      <TechnicianAutoComplete
        disabled={disableAutoComplete}
        getTechnician={(value) => {
          formik.setValues({
            ...formik.values,
            technicianId: value ? value.id! : null,
          });
        }}
        initialValue={activeTechnician?.technician}
        textFieldProps={{
          error: !!(formik.errors.technicianId && formik.touched.technicianId),
          helperText:
            formik.errors.technicianId && formik.touched.technicianId
              ? formik.errors.technicianId
              : '',
          label: t('Technicians Name'),
          onBlur: formik.handleBlur,
        }}
      />
      <FormInput
        props={{
          size: 'small',
          placeholder: 'Enter priority number',
          label: 'Priority',
          name: 'priority',
          value: formik.values.priority,
          onChange: formik.handleChange,
          helperText: formik.errors.priority,
          error: !!formik.errors.priority,
          onBlur: formik.handleBlur,
          required: true,
          sx: {
            mt: '0.5em',
          },
          type: 'number',
          inputProps: {min: 0},
        }}
      />
    </Box>
  );
};
