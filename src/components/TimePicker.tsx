import TextField from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {TimePicker as MuiTimePicker} from '@mui/x-date-pickers/TimePicker';
import {FocusEvent, useEffect, useState} from 'react';
import Box from '@mui/material/Box';

interface Props {
  defaultTime?: Date | null;
  getSelectedTime: (state: Date | null) => void;
  label: string;
  containerStyles?: {[key: string]: any};
  inputName: string;
  inputError?: string;
  fieldStyles?: {[key: string]: any};
  handleBlur?: (e: FocusEvent<any, Element>) => void;
}

export const TimePicker = ({
  defaultTime,
  getSelectedTime,
  label,
  containerStyles,
  inputName,
  inputError,
  handleBlur,
  fieldStyles,
}: Props) => {
  const [value, setValue] = useState<Date | null>(null);

  useEffect(() => {
    if (defaultTime) {
      setValue(defaultTime);
    }
  }, []);

  useEffect(() => {
    if (getSelectedTime) {
      getSelectedTime(value);
    }
  }, [value]);

  return (
    <Box sx={{...containerStyles}}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiTimePicker
          inputFormat="HH:mm"
          ampm={false}
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
