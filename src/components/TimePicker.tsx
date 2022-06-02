import {TextFieldProps} from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {TimePicker as MuiTimePicker} from '@mui/x-date-pickers/TimePicker';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {FormInput} from './form/FormInput';

interface Props {
  defaultTime?: Date | null;
  getSelectedTime?: (state: Date | null) => void;
  containerStyles?: {[key: string]: any};
  textFieldProps?: TextFieldProps;
}

export const TimePicker = ({
  defaultTime,
  getSelectedTime,
  containerStyles,
  textFieldProps,
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
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <FormInput
              props={{
                ...params,
                size: 'small',
                ...textFieldProps,
              }}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};
