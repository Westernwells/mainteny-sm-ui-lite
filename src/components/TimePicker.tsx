import {TextFieldProps} from '@mui/material/TextField';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {
  TimePicker as MuiTimePicker,
  TimePickerProps,
} from '@mui/x-date-pickers/TimePicker';
import {ReactNode, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {SxProps} from '@mui/material';
import {useTranslation} from 'react-i18next';
import CustomActionBar from './CustomActionBar';
import CustomToolbar from './CustomToolbar';

interface Props extends Partial<TimePickerProps<Date>> {
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
  const {t} = useTranslation();
  const [value, setValue] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  const popperSx: SxProps = {
    '& .MuiPickersPopper-paper': {
      width: '215px',
      height: '368px',
    },
    '& .MuiPickersLayout-root': {
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiPickersDay-dayWithMargin': {
      border: '1px solid #222B451F',
      borderRadius: 0,
      margin: 0,
      padding: '10px 20px',
      fontSize: '0.8rem',

      '&:hover': {
        background: '#00D1FF80',
        color: '#222B45',
        fontWeight: '400',
      },
    },
    '& .MuiButtonBase-root-MuiPickersDay-root:not(.Mui-selected)': {
      border: 'none',
    },
    '& .MuiDayCalendar-weekContainer': {
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
    '& .MuiPickersLayout-contentWrapper': {
      height: '253px',
    },
    '& .MuiPickersLayout-contentWrapper > .MuiMultiSectionDigitalClock-root': {
      display: 'flex',
      justifyContent: 'center',
      overflow: 'hidden',
      borderBottom: 'none',
      padding: '0 24px',
      position: 'relative',
    },
    '& .MuiMultiSectionDigitalClock-root > .MuiList-padding:nth-child(1)': {
      position: 'relative',
      borderLeft: '1px solid #8F9BB380',
      borderBottom: '1px solid #8F9BB380',
      borderTopLeftRadius: '4px',
      borderBottomLeftRadius: '4px',

      '&::after': {
        content: "''",
        position: 'sticky',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '11px',
        background: 'linear-gradient(#FFFFFF 35%, #8F9BB380)',
      },
    },
    '& .MuiMultiSectionDigitalClock-root > .MuiList-padding:nth-child(2)': {
      borderBottom: '1px solid #8F9BB380',
      borderTopRightRadius: '4px',
      borderBottomRightRadius: '4px',
      position: 'relative',

      '&::after': {
        content: "''",
        position: 'sticky',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '11px',
        background: 'linear-gradient(#FFFFFF 35%, #8F9BB380)',
      },
    },
    '& .MuiMultiSectionDigitalClock-root > .MuiList-padding': {
      borderRight: '1px solid #8F9BB380',
      borderTop: '1px solid #8F9BB380',
      width: '82px',
      overflowY: 'scroll',
      maxHeight: '260px',
      marginTop: '1em',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',

      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    '& .MuiMultiSectionDigitalClock-root > .MuiMultiSectionDigitalClock-root > .MuiButtonBase-root':
      {
        padding: '0.3em 0.4em',
        width: '100%',
        margin: '0',

        '&:hover': {
          background: '#00D1FF80',
        },
      },
    '& .MuiMultiSectionDigitalClock-root > .MuiMultiSectionDigitalClock-root': {
      '&::after': {
        height: 0,
      },
    },
  };

  const renderToolbar = (label: ReactNode) => (
    <CustomToolbar
      toolBarTitle={label}
      onClose={handleClose}
      isDatePicker={false}
    />
  );

  const renderActionBar = () => (
    <CustomActionBar
      onAccept={handleClose}
      onClear={handleClose}
      isDatePicker={false}
    />
  );

  return (
    <Box sx={{...containerStyles}}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiTimePicker
          {...props}
          open={open}
          onClose={() => setOpen(false)}
          ampm={false}
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
              label: t(`${textFieldProps?.label}`),
              size: textFieldProps?.size || 'small',
              sx: {width: '100%'},
              InputLabelProps: {
                shrink: true,
                onClick: handleOpen,
              },
              inputProps: {
                type: 'input',
                onClick: handleOpen,
              },
            },
            inputAdornment: {
              position: 'end',
              onClick: handleOpen,
            },
          }}
          slots={{
            toolbar: () => renderToolbar(textFieldProps?.label),
            actionBar: () => renderActionBar(),
          }}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          minTime={minTime}
          maxTime={maxTime}
          closeOnSelect={false}
        />
      </LocalizationProvider>
    </Box>
  );
};
