import Grid from '@mui/material/Grid';
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
    <Grid container spacing={2} alignItems="end">
      <Grid item xs={12} md={6} sm={6}>
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
            InputLabelProps: {shrink: true},
            error: !!(
              formik.errors.technicianId && formik.touched.technicianId
            ),
            label: t('Engineers Name'),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} sm={6}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'Enter priority number',
            label: 'Priority',
            name: 'priority',
            value: formik.values.priority,
            onChange: formik.handleChange,
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
      </Grid>
    </Grid>
  );
};
