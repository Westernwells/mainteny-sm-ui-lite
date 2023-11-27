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
      height: '400px',
      width: '245px',
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
    },
    '& .MuiPickersDay-dayWithMargin:hover': {
      background: '#00D1FF80',
      color: '#222B45',
      fontWeight: '400',
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
    '& .MuiPickersLayout-contentWrapper > .MuiMultiSectionDigitalClock-root': {
      display: 'flex',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    '& .MuiMultiSectionDigitalClock-root > .MuiMultiSectionDigitalClock-root': {
      border: '1px solid #8F9BB380',
      width: '83px',
      overflowY: 'hidden',
      scrollbarWidth: 'none',
      maxHeight: '260px',
      marginTop: '1em',
    },
    '& .MuiMultiSectionDigitalClock-root > .MuiMultiSectionDigitalClock-root:hover':
      {
        overflowY: 'scroll',
      },
    '& .MuiMultiSectionDigitalClock-root > .MuiMultiSectionDigitalClock-root > .MuiButtonBase-root':
      {
        padding: '0.4em',
        width: '100%',
        margin: '0',
      },
    '& .MuiMultiSectionDigitalClock-root > .MuiMultiSectionDigitalClock-root > .MuiButtonBase-root:hover':
      {
        background: '#00D1FF80',
      },
  };

  const renderToolbar = (label: ReactNode) => (
    <CustomToolbar
      toolBarTitle={label}
      onClose={handleClose}
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
              InputLabelProps: {
                shrink: true,
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
            actionBar: CustomActionBar,
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
