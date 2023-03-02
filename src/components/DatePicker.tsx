import {TextFieldProps} from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker as MuiDatePicker} from '@mui/x-date-pickers/DatePicker';
import {InputLabelProps} from '@mui/material/InputLabel';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {mapLanguageToLocale} from 'utils/utils';
import {useEffect, useState} from 'react';
import {locales} from 'utils/datetime';
import Box from '@mui/material/Box';
import {FormInput} from './form/FormInput';

interface Props {
  defaultDate?: Date | null;
  getSelectedDate?: (state: Date | null) => void;
  containerStyles?: {[key: string]: any};
  minDate?: Date;
  maxDate?: Date;
  textFieldProps?: TextFieldProps;
  inputLabelProps?: InputLabelProps;
  reset?: boolean;
  getReset?: (reset: boolean) => void;
  required?: boolean;
  dateFormat?: string;
  mask?: string;
  disableMask?: boolean;
}

export const DatePicker = ({
  defaultDate = null,
  getSelectedDate,
  containerStyles,
  minDate,
  maxDate,
  textFieldProps,
  inputLabelProps,
  reset = false,
  getReset = () => {},
  required,
  dateFormat,
  mask = '__.__.____"',
  disableMask,
}: Props) => {
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  const [value, setValue] = useState<Date | null>(defaultDate);
  // const format = user?.userAccount.serviceCompany.settings.dateFormat || dateFormat

  useEffect(() => {
    setValue(defaultDate);
  }, []);

  useEffect(() => {
    if (reset) {
      setValue(defaultDate);
      if (getReset) getReset(reset);
    }
  }, [reset]);

  useEffect(() => {
    if (getSelectedDate) {
      getSelectedDate(value);
    }
  }, [value]);
  return (
    <Box sx={{...containerStyles}}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={locales[locale]}>
        <MuiDatePicker
          inputFormat={
            dateFormat || user?.userAccount.serviceCompany.settings.dateFormat
          }
          mask={mask}
          disableMaskedInput={disableMask}
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
                required,
                ...textFieldProps,
                onKeyDown: (e) => {
                  e.preventDefault();
                },
              }}
              inputLabelProps={inputLabelProps}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};
