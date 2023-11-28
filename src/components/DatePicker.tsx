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
import {ReactNode, useEffect, useRef, useState} from 'react';
import {locales} from 'utils/datetime';
import Box from '@mui/material/Box';
import {SxProps, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import CustomActionBar from './CustomActionBar';
import CustomToolbar from './CustomToolbar';

interface Props extends Partial<DatePickerProps<Date>> {
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
  inputLabelProps,
  textFieldProps,
  reset = false,
  getReset = () => {},
  required,
  dateFormat,
  errorMessage,
  ...props
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  const [value, setValue] = useState<Date | null>(defaultDate);
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpen = () => {
    setOpen(true);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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
      width: '350px',
    },
    '& .MuiDayCalendar-header': {
      width: '100%',
    },
    '& .MuiPickersLayout-contentWrapper': {
      position: 'relative',
    },
    '& .MuiPickersLayout-contentWrapper > .MuiDateCalendar-root': {
      height: '100%',
      position: 'relative',
    },
    '& .MuiDayCalendar-header > .MuiDayCalendar-weekDayLabel': {
      width: '40px',
      fontSize: '0.85rem',
    },
    '& .MuiDayCalendar-root > .MuiDayCalendar-slideTransition': {
      minHeight: '180px',
      overflow: 'hidden',
    },
    '& .MuiCalendarPicker-root': {
      boxShadow: '0px 9px 46px 8px #0000001F',
      overflow: 'hidden',
    },
    '& .MuiButtonBase-root .MuiPickersDay-root .MuiPickersDay-dayWithMargin .MuiPickersDay-today':
      {
        border: 'none',
      },
    '& .MuiDayCalendar-weekContainer > .MuiPickersDay-dayWithMargin': {
      border: 'none',
      borderRight: '1px solid #222B451F',
      borderBottom: '1px solid #222B451F',
      borderRadius: 0,
      margin: 0,
      padding: '15px 22px',
      fontSize: '0.9rem',

      '&:hover': {
        background: '#00D1FF80',
        color: '#222B45',
        fontWeight: '400',
      },
    },
    '& .MuiButtonBase-root MuiPickersDay-root MuiPickersDay-dayWithMargin': {
      color: 'white',
    },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer .MuiPickersDay-dayWithMargin:first-child':
      {
        borderLeft: '1px solid #222B451F',
      },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer:first-child .MuiPickersDay-dayWithMargin:nth-child(-n + 7)':
      {
        borderTop: '1px solid #222B451F',
      },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer:last-child .MuiPickersDay-dayWithMargin:nth-last-child(-n+7)':
      {
        borderBottom: '1px solid #222B451F',
        borderTop: '0',
      },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer:first-child .MuiPickersDay-dayWithMargin:first-child':
      {
        borderTopLeftRadius: '4px',
      },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer:first-child .MuiPickersDay-dayWithMargin:last-child':
      {
        borderTopRightRadius: '4px',
      },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer:last-child .MuiPickersDay-dayWithMargin:nth-last-child(7)':
      {
        borderBottomLeftRadius: '4px',
      },
    '& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer:last-child .MuiPickersDay-dayWithMargin:last-child':
      {
        borderBottomRightRadius: '4px',
      },
    '& .MuiPickersDay-dayWithMargin:hover': {
      color: 'white',
    },
    '& .MuiDayCalendar-weekContainer': {
      margin: 0,
      padding: 0,
    },
    '& .MuiPickersDay-dayOutsideMonth': {
      '&:hover': {
        color: '#8F9BB3',
        background: 'none',
      },
    },
    '& .MuiPickersCalendarHeader-switchViewButton': {
      display: 'none',
    },
    '& .MuiPickersCalendarHeader-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
    },
    '& .MuiPickersCalendarHeader-labelContainer': {
      position: 'absolute',
      textAlign: 'center',
      left: '39%',
      margin: '-15px 0 0 -15px',
    },
    '& .MuiIconButton-edgeStart': {
      position: 'absolute',
      right: '0',
      marginRight: '0em',
      marginTop: '-1em',
      border: '1px solid #222B451F',
      padding: '5px',
      borderRadius: '4px',
    },
    '& .MuiIconButton-edgeEnd': {
      position: 'absolute',
      left: '0',
      marginLeft: '0em',
      marginTop: '-1em',
      border: '1px solid #222B451F',
      padding: '5px',
      borderRadius: '4px',
    },
    '& .MuiPickersLayout-root': {
      display: 'flex',
      flexDirection: 'column',
    },
  };

  const renderToolbar = (label: ReactNode) => (
    <CustomToolbar toolBarTitle={label} onClose={handleClose} isDatePicker />
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
          closeOnSelect={false}
          slotProps={{
            actionBar: {
              actions: ['clear', 'accept'],
            },
            toolbar: {
              hidden: false,
            },
            popper: {
              sx: popperSx,
            },
            textField: {
              ...textFieldProps,
              size: textFieldProps?.size || 'small',
              label: t(`${textFieldProps?.label}`),
              sx: {width: '100%'},
              InputLabelProps: {
                shrink: true,
                required,
                ...inputLabelProps,
              },
              inputProps: {
                type: 'input',
                onClick: handleOpen,
                ref: inputRef,
              },
            },
            inputAdornment: {
              position: 'end',
              onClick: handleOpen,
            },
          }}
          slots={{
            toolbar: () => renderToolbar(textFieldProps?.label),
            actionBar: CustomActionBar,
          }}
          format={
            dateFormat || user?.userAccount.serviceCompany.settings.dateFormat
          }
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onChange={(newValue) => {
            setValue(newValue);
          }}
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
