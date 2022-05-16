import * as React from 'react';
import TextField from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker as MuiDatePicker} from '@mui/x-date-pickers/DatePicker';
import {useEffect} from 'react';
import Box from '@mui/material/Box';

interface Props {
  defaultDate?: Date | null;
  getSelectedDate: (state: Date | null) => void;
  label: string;
  containerStyles?: {[key: string]: any};
  inputName: string;
  inputError?: string;
}

export const DatePicker = ({
  defaultDate,
  getSelectedDate,
  label,
  inputName,
  containerStyles,
  inputError,
}: Props) => {
  const [value, setValue] = React.useState<Date | null>(null);

  useEffect(() => {
    if (defaultDate) {
      setValue(defaultDate);
    }
  }, []);

  useEffect(() => {
    if (getSelectedDate) {
      getSelectedDate(value);
    }
  }, [value]);
  return (
    <Box sx={{...containerStyles}}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          inputFormat="dd.MM.yyy"
          label={label}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              name={inputName}
              error={!!inputError}
              helperText={inputError}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};
