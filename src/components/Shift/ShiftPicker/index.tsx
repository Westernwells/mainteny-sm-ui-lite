import {Box} from '@mui/material';
import {TimePicker} from 'components/TimePicker';
import {Shift} from 'models/employee';
import {getShiftStringFromDate, mapShiftStringDateToDate} from 'utils/shift';
import {useMemo} from 'react';
import {parseTimeFromHoursMinutesToDate} from 'utils/datetime';

type Props = {
  shift?: Partial<Shift>;
  minimumTime?: string;
  onChange: (newShift: Partial<Shift> | undefined) => void;
};

const ShiftPicker = ({shift, minimumTime, onChange}: Props) => {
  const {fromTime, toTime} = useMemo(
    () => mapShiftStringDateToDate(shift),
    [shift],
  );

  const minimumTimeDate = minimumTime
    ? parseTimeFromHoursMinutesToDate(minimumTime)
    : undefined;

  return (
    <Box sx={{display: 'flex', width: '264px', alignItems: 'center'}} gap={1}>
      <TimePicker
        disableInternalState
        defaultTime={fromTime}
        minTime={minimumTimeDate}
        maxTime={toTime}
        getSelectedTime={(newValue) => {
          onChange({
            ...(shift || {}),
            fromTime: newValue ? getShiftStringFromDate(newValue) : undefined,
          });
        }}
        textFieldProps={{
          label: '',
          onKeyDown: (e) => e.preventDefault(),
        }}
      />
      -
      <TimePicker
        disableInternalState
        defaultTime={toTime}
        minTime={fromTime}
        getSelectedTime={(newValue) => {
          onChange({
            ...(shift || {}),
            toTime: newValue ? getShiftStringFromDate(newValue) : undefined,
          });
        }}
        textFieldProps={{
          label: '',
          onKeyDown: (e) => e.preventDefault(),
        }}
      />
    </Box>
  );
};

export default ShiftPicker;
