import {useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
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
import {convertToMacro, convertToText} from 'utils/utils';
import {Shift, EmployeeAccountData} from './model';

export const SelectShift = () => {
  const workDays = Object.values(TimeWindowType).map((item) =>
    convertToText(item),
  );

  const defaultTime = {
    fromTime: new Date(0, 0, 0, 7, 0),
    toTime: new Date(0, 0, 0, 18, 0),
  };

  const convertToLocaleTimeString = (date: Date) =>
    date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const {setFieldValue, values} = useFormikContext<EmployeeAccountData>();

  const [shifts, setShifts] = useState<Shift<Date | null>[]>(
    values.shifts && values.shifts.length
      ? values.shifts.map((item) => ({
          fromTime: new Date(
            0,
            0,
            0,
            item.fromTime.split(':')[0] as unknown as number,
            item.fromTime.split(':')[1] as unknown as number,
          ),
          toTime: new Date(
            0,
            0,
            0,
            item.toTime.split(':')[0] as unknown as number,
            item.toTime.split(':')[1] as unknown as number,
          ),
          type: convertToText(item.type),
        }))
      : [
          {
            ...defaultTime,
            type: convertToText(TimeWindowType.WEEKDAY),
          },
        ],
  );

  const handleAddShift = () => {
    const selectedWorkDays = shifts.map((shift) => shift.type);
    setShifts((prev) => [
      ...prev,
      {
        ...defaultTime,
        type: workDays.filter((item) => !selectedWorkDays.includes(item))[0],
      },
    ]);
  };

  const handleRemoveShift = () => {
    setShifts((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    setFieldValue(
      'shifts',
      shifts.map((item) => ({
        fromTime: item.fromTime && convertToLocaleTimeString(item.fromTime),
        toTime: item.toTime && convertToLocaleTimeString(item.toTime),
        type: convertToMacro(item.type),
      })),
    );
  }, [shifts]);

  return (
    <>
      {shifts.map((shift, index) => (
        <Box
          key={shift.type}
          display="flex"
          gap="1em"
          alignItems="flex-end"
          mt="1em">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Start Time"
              ampm={false}
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
              ampm={false}
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
              value={shift.type}
              label="Day"
              size="small"
              disabled={index < shifts.length - 1}
              onChange={(event: SelectChangeEvent) => {
                const oldShifts = shifts.filter((item) => item !== shift);
                const newShift = shift;
                newShift.type = event.target.value;
                setShifts([...oldShifts, newShift]);
              }}>
              {workDays.map((item) => (
                <MenuItem
                  value={item}
                  key={item}
                  disabled={shifts.map((s) => s.type).includes(item)}>
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
