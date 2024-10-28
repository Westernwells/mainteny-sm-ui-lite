import React from 'react';
import {Box, TextField, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';
import {TechnicianAutoComplete} from 'components/TechnicianAutoComplete';
import {EmployeesSimpleView, EmployeesView} from 'models/employee';

type Props = {
  selectedTechnician?: EmployeesView;
  onChange: (value?: EmployeesView) => void;
};

const TechnicianInput = ({selectedTechnician, onChange}: Props) => {
  const {t} = useTranslation();

  const handleChange = (value: EmployeesView | EmployeesSimpleView | null) => {
    if (value === null) onChange(undefined);
    onChange(value as EmployeesView);
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
      <Typography variant="subtitle2">{capitalize(t('Engineer'))}</Typography>
      <TechnicianAutoComplete
        getTechnician={handleChange}
        size="small"
        initialValue={selectedTechnician}
        required={false}
        textFieldProps={{
          label: t('Select engineer'),
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder={t('Select engineer')} />
        )}
      />
    </Box>
  );
};

export default TechnicianInput;
