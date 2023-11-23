import {TextFieldProps} from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {
  DatePickerProps,
  DatePicker as MuiDatePicker,
} from '@mui/x-date-pickers/DatePicker';
import {InputLabelProps} from '@mui/material/InputLabel';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {mapLanguageToLocale} from 'utils/utils';
import {ReactNode, useEffect, useState} from 'react';
import {locales} from 'utils/datetime';
import Box from '@mui/material/Box';
import {SxProps, Typography} from '@mui/material';
import {FormInput} from './form/FormInput';
import CustomActionBar from './CustomActionBar';
import CustomToolbar from './CustomToolbar';

interface Props extends Partial<DatePickerProps<Date, Date>> {
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
  disableMask?: boolean;
  errorMessage?: string;
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
  disableMask,
  errorMessage,
  ...props
}: Props) => {
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  const [value, setValue] = useState<Date | null>(defaultDate);
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  const errorProps: any = {};

  if (errorMessage) {
    errorProps.error = true;
  }

  const popperSx: SxProps = {
    '& .MuiPickersPopper-paper': {
      height: '440px',
      width: '350px',
    },
    '& . MuiCalendarOrClockPicker-root ': {
      minHeight: '320px',
    },
    '& .MuiCalendarPicker-root': {
      boxShadow: '0px 9px 46px 8px #0000001F',
      overflow: 'hidden',
    },
    '& .MuiPickersDay-dayWithMargin': {
      border: '1px solid #222B451F',
      borderRadius: 0,
      margin: 0,
      padding: '10px 20px',
      fontSize: '0.8rem',
    },
    '& .MuiPickersDay-dayWithMargin:hover': {
      background: '#00D1FF80',
      color: '#222B45',
      fontWeight: '400',
    },
    '& .MuiDayPicker-weekContainer': {
      margin: 0,
      padding: 0,
    },
    '& .MuiPickersDay-dayOutsideMonth:hover': {
      color: '#8F9BB3',
      background: 'none',
    },
    '& .MuiPickersCalendarHeader-switchViewButton': {
      display: 'none',
    },
    '& .MuiPickersCalendarHeader-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    '& .MuiPickersCalendarHeader-labelContainer': {
      position: 'absolute',
      left: '38%',
      textAlign: 'center',
    },
    '& .MuiIconButton-edgeStart': {
      position: 'absolute',
      right: '0',
      marginRight: '1.4em',
      marginTop: '-1em',
      border: '1px solid #222B451F',
      padding: '5px',
      borderRadius: 0,
    },
    '& .MuiIconButton-edgeEnd': {
      position: 'absolute',
      left: '0',
      marginLeft: '1.4em',
      marginTop: '-1em',
      border: '1px solid #222B451F',
      padding: '5px',
      borderRadius: 0,
    },
  };

  const renderToolbar = (label: ReactNode) => (
    <CustomToolbar toolBarTitle={label} onClose={handleClose} />
  );
  return (
    <Box sx={{...containerStyles}}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={locales[locale]}>
        <MuiDatePicker
          {...props}
          open={open}
          onClose={() => setOpen(false)}
          showDaysOutsideCurrentMonth
          PopperProps={{sx: popperSx}}
          closeOnSelect={false}
          showToolbar
          ToolbarComponent={() => renderToolbar(textFieldProps?.label)}
          componentsProps={{
            actionBar: {
              actions: ['clear', 'accept'],
            },
          }}
          components={{
            ActionBar: CustomActionBar,
          }}
          inputFormat={
            dateFormat || user?.userAccount.serviceCompany.settings.dateFormat
          }
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
                onClick: handleOpen,
                ...errorProps,
              }}
              inputLabelProps={inputLabelProps}
            />
          )}
        />
      </LocalizationProvider>
      {!!errorMessage && (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};
