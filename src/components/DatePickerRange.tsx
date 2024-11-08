import {DateRange, LocalizationProvider} from '@mui/x-date-pickers-pro/';
import {
  DateRangePicker,
  DateRangePickerProps,
  DateRangePickerSlotsComponentsProps,
} from '@mui/x-date-pickers-pro/DateRangePicker';
import {SingleInputDateRangeField} from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import {DemoContainer} from '@mui/x-date-pickers/internals/demo';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {locales} from 'utils/datetime';
import {mapLanguageToLocale} from 'utils/utils';
import {ReactNode, useEffect, useRef, useState} from 'react';
import {Box, InputLabelProps, SxProps, TextFieldProps} from '@mui/material';
import {useTranslation} from 'react-i18next';
import CalendarToday from '@mui/icons-material/CalendarToday';
import {parseISO} from 'date-fns';
import DateRangeCustomToolbar from './DateRangeCustomToolbar';
import DateRangeActionBar from './DateRangeActionBar';

interface Props extends Partial<DateRangePickerProps<Date>> {
  defaultDate?: DateRange<Date>;
  minDate?: Date;
  maxDate?: Date;
  getSelectedDate: (state: DateRange<Date>) => void;
  dateFormat?: string;
  disableMask?: boolean;
  containerStyles?: {[key: string]: any};
  textFieldProps?: TextFieldProps;
  inputLabelProps?: InputLabelProps;
  onClear: () => void;
  inputTestId?: string;
  popupTestId?: string;
  onAccept?: () => void;
}

const DatePickerRange = ({
  minDate,
  maxDate,
  defaultDate,
  getSelectedDate,
  dateFormat,
  containerStyles,
  textFieldProps,
  inputLabelProps,
  onClear,
  inputTestId,
  popupTestId,
  ...props
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];
  const [value, setValue] = useState<DateRange<Date | null>>([null, null]);
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpen = (openState: boolean) => {
    setOpen(!openState);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleSelect = () => {
    props.onAccept?.();
    setOpen(false);
  };

  const handleClose = () => {
    onClear();
    props.onClose?.();
    setOpen(false);
  };

  const handleClear = () => {
    setValue([null, null]);
    onClear();
  };

  useEffect(() => {
    if (defaultDate) {
      const [start, end] = defaultDate;
      const startDate = start
        ? start instanceof Date
          ? start
          : parseISO(String(start))
        : null;
      const endDate = end
        ? end instanceof Date
          ? end
          : parseISO(String(end))
        : null;
      setValue([startDate, endDate]);
    }
  }, [defaultDate]);

  const popperSx: SxProps = {
    '& .MuiPickersLayout-contentWrapper': {
      margin: '3em 0em 2em 0em',
    },
    '& .MuiButtonBase-root,  .MuiPickersDay-root': {
      borderRadius: 0,
    },
    '& .MuiDateRangePickerDay-root, .MuiDateRangePickerDay-root:first-of-type, .MuiDateRangePickerDay-root:last-of-type':
      {
        borderTopLeftRadius: '0%',
        borderBottomLeftRadius: '0%',
        borderTopRightRadius: '0%',
        borderBottomRightRadius: '0%',

        '&:hover': {
          background: '#00D1FF80',
          color: '#222B45',
          fontWeight: '400',
          border: 'none',
        },
      },
  };

  const renderToolbar = (label: ReactNode) => (
    <DateRangeCustomToolbar
      toolBarTitle={label}
      onClose={handleClose}
      isDatePicker
    />
  );

  const renderActionBar = () => (
    <DateRangeActionBar
      onAccept={handleSelect}
      onClear={handleClear}
      isDatePicker
    />
  );

  return (
    <Box sx={{...containerStyles}}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={locales[locale]}>
        <DemoContainer components={['SingleInputDateRangeField']}>
          <DateRangePicker
            {...props}
            defaultValue={defaultDate}
            slots={{
              field: SingleInputDateRangeField,
              toolbar: () => renderToolbar(textFieldProps?.label),
              actionBar: () => renderActionBar(),
            }}
            open={open}
            onClose={() => setOpen(false)}
            showDaysOutsideCurrentMonth
            closeOnSelect={false}
            format={
              dateFormat || user?.userAccount.serviceCompany.settings.dateFormat
            }
            value={value}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(newDateRange: DateRange<Date>) => {
              setValue(newDateRange);
              getSelectedDate(newDateRange);
            }}
            slotProps={
              {
                actionBar: {
                  actions: ['clear', 'accept'],
                },
                toolbar: {
                  hidden: false,
                },
                popper: {
                  sx: popperSx,
                  'data-testid': popupTestId,
                },
                textField: {
                  ...textFieldProps,
                  size: textFieldProps?.size || 'small',
                  error: false,
                  label: t(`${textFieldProps?.label}`),
                  sx: {width: '100%', background: 'white'},
                  InputProps: {
                    endAdornment: (
                      <CalendarToday sx={{color: 'action.active'}} />
                    ),
                    onClick: () => handleOpen(open),
                    sx: {cursor: 'pointer'},
                  },
                  InputLabelProps: {
                    shrink: true,
                    ...inputLabelProps,
                  },
                  inputProps: {
                    type: 'input',
                    onClick: () => handleOpen(open),
                    ref: inputRef,
                    'data-testid': inputTestId,
                  },
                },
              } as unknown as DateRangePickerSlotsComponentsProps<Date>
            }
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
};

export default DatePickerRange;
