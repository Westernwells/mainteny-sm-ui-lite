import TextField from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker as MuiDatePicker} from '@mui/x-date-pickers/DatePicker';
import {FocusEvent, useEffect, useState} from 'react';
import Box from '@mui/material/Box';

interface Props {
  defaultDate?: Date | null;
  getSelectedDate: (state: Date | null) => void;
  label: string;
  containerStyles?: {[key: string]: any};
  fieldStyles?: {[key: string]: any};
  inputName: string;
  inputError?: string;
  handleBlur?: (e: FocusEvent<any, Element>) => void;
  minDate?: Date;
}

export const DatePicker = ({
  defaultDate,
  getSelectedDate,
  label,
  inputName,
  containerStyles,
  inputError,
  handleBlur,
  fieldStyles,
  minDate,
}: Props) => {
  const [value, setValue] = useState<Date | null>(null);

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
          minDate={minDate}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              name={inputName}
              sx={{...fieldStyles}}
              error={!!inputError}
              helperText={inputError}
              onBlur={handleBlur}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};
