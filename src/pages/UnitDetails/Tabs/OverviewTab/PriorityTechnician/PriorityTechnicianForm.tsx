import Box from '@mui/material/Box';
import {FormInput} from 'components/form/FormInput';
import {TechnicianAutoComplete} from 'components/TechnicianAutoComplete';
import {FormikProps} from 'formik';
import {MaintainerView} from 'models/technician';
import React from 'react';
import {PriorityTechnicianFormModel} from '../models';

interface Props {
  formik: FormikProps<PriorityTechnicianFormModel>;
  activeTechnician?: MaintainerView;
  disableAutoComplete?: boolean;
}

export const PriorityTechnicianForm = ({
  formik,
  activeTechnician,
  disableAutoComplete,
}: Props) => (
  <Box sx={{mt: '0.5em'}}>
    <TechnicianAutoComplete
      disabled={disableAutoComplete}
      getTechnician={(value) => {
        formik.setValues({
          ...formik.values,
          technicianId: value ? value.id : null,
        });
      }}
      initialValue={activeTechnician?.technician}
      textFieldProps={{
        error: !!(formik.errors.technicianId && formik.touched.technicianId),
        helperText:
          formik.errors.technicianId && formik.touched.technicianId
            ? formik.errors.technicianId
            : '',
        label: 'Technicians Name',
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
      }}
    />
  </Box>
);
