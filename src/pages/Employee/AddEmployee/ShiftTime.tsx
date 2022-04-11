import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import TimePicker from '@mui/lab/TimePicker';
import {TimeWindowType} from 'models/misc';
import {convertToText} from 'utils/utils';

interface Shift {
  fromTime: Date | null;
  toTime: Date | null;
  workDays: string;
}

export const ShiftTime = () => {
  const workDays = Object.values(TimeWindowType).map((item) =>
    convertToText(item),
  );

  const [shifts, setShifts] = useState<Shift[]>([
    {
      fromTime: new Date(0, 0, 0, 9, 0),
      toTime: new Date(0, 0, 0, 18, 0),
      workDays: workDays[0],
    },
  ]);

  const handleAddShift = () => {
    const selectedWorkDays = shifts.map((shift) => shift.workDays);
    setShifts([
      ...shifts,
      {
        fromTime: new Date(0, 0, 0, 9, 0),
        toTime: new Date(0, 0, 0, 18, 0),
        workDays: workDays.filter(
          (item) => !selectedWorkDays.includes(item),
        )[0],
      },
    ]);
  };
  const handleRemoveShift = () => {
    setShifts(shifts.slice(0, -1));
  };

  console.log(shifts[0].workDays);
  return (
    <>
      {shifts.map((shift, index) => (
        <Box
          key={shift.workDays}
          display="flex"
          gap="1em"
          alignItems="flex-end"
          mt="2em">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Start Time"
              value={shift.fromTime}
              disabled={index < shifts.length - 1}
              onChange={(newValue) => {
                const oldShifts = shifts.filter((item) => item !== shift);
                const newShift = shift;
                newShift.fromTime = newValue;
                setShifts([...oldShifts, newShift]);
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="End Time"
              value={shift.toTime}
              disabled={index < shifts.length - 1}
              onChange={(newValue) => {
                const oldShifts = shifts.filter((item) => item !== shift);
                const newShift = shift;
                newShift.toTime = newValue;
                setShifts([...oldShifts, newShift]);
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel
              id="shiftDaySelect-label"
              sx={{
                bgcolor: 'white',
                color: 'text.primary',
                paddingInline: '.5em',
              }}
              disabled={index < shifts.length - 1}>
              Day
            </InputLabel>
            <Select
              labelId="shiftDaySelect-label"
              id="shiftDaySelect"
              value={shift.workDays}
              label="Day"
              size="small"
              disabled={index < shifts.length - 1}
              onChange={(event: SelectChangeEvent) => {
                const oldShifts = shifts.filter((item) => item !== shift);
                const newShift = shift;
                newShift.workDays = event.target.value;
                setShifts([...oldShifts, newShift]);
              }}>
              {workDays.map((item) => (
                <MenuItem
                  value={item}
                  key={item}
                  disabled={shifts.map((s) => s.workDays).includes(item)}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ))}

      <Box mt="1em">
        <Button
          variant="outlined"
          color="info"
          size="small"
          onClick={handleAddShift}
          disabled={shifts.length === workDays.length}
          sx={{
            mr: '1em',
            borderColor: 'info.main',
            bgcolor: 'transparent',
          }}>
          Add
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleRemoveShift}
          disabled={shifts.length === 1}
          sx={{
            mr: '1em',
            borderColor: 'error.main',
            bgcolor: 'transparent',
          }}>
          Remove
        </Button>
      </Box>
    </>
  );
};
