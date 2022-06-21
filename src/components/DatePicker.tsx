import {TextFieldProps} from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker as MuiDatePicker} from '@mui/x-date-pickers/DatePicker';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {FormInput} from './form/FormInput';

interface Props {
  defaultDate?: Date | null;
  getSelectedDate?: (state: Date | null) => void;
  containerStyles?: {[key: string]: any};
  minDate?: Date;
  maxDate?: Date;
  textFieldProps?: TextFieldProps;
}

export const DatePicker = ({
  defaultDate,
  getSelectedDate,
  containerStyles,
  minDate,
  maxDate,
  textFieldProps,
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
          mask="__.__.____"
          value={value}
          minDate={minDate}
          maxDate={maxDate}
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
