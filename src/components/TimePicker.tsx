import {TextFieldProps} from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {
  TimePicker as MuiTimePicker,
  TimePickerProps,
} from '@mui/x-date-pickers/TimePicker';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {FormInput} from './form/FormInput';

interface Props extends Partial<TimePickerProps<Date, Date>> {
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
  minTime,
  maxTime,
  ...props
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
          {...props}
          inputFormat="HH:mm"
          ampm={false}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          minTime={minTime}
          maxTime={maxTime}
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
