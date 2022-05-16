import * as React from 'react';
import TextField from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {TimePicker as MuiTimePicker} from '@mui/x-date-pickers/TimePicker';
import {useEffect} from 'react';
import Box from '@mui/material/Box';

interface Props {
  defaultTime?: Date | null;
  getSelectedTime: (state: Date | null) => void;
  label: string;
  containerStyles?: {[key: string]: any};
  inputName: string;
  inputError?: string;
}

export const TimePicker = ({
  defaultTime,
  getSelectedTime,
  label,
  containerStyles,
  inputName,
  inputError,
}: Props) => {
  const [value, setValue] = React.useState<Date | null>(null);

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
              error={!!inputError}
              helperText={inputError}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};
