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

const workDays = ['weekdays', 'weekends', 'public_holidays'];

export const ShiftTime = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [shiftDays, setShiftDays] = useState(workDays[0]);

  const handleShiftDays = (event: SelectChangeEvent) => {
    setShiftDays(event.target.value as string);
  };

  console.log('gg');
  return (
    <>
      <Box display="flex" gap="1em" alignItems="flex-end" mt="2em">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => {
              setStartTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="End Time"
            value={startTime}
            onChange={(newValue) => {
              setStartTime(newValue);
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
            }}>
            Day
          </InputLabel>
          <Select
            labelId="shiftDaySelect-label"
            id="shiftDaySelect"
            value={shiftDays}
            label="Day"
            size="small"
            onChange={handleShiftDays}>
            {workDays.map((item) => (
              <MenuItem value={item} key={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box mt="1em">
        <Button
          variant="outlined"
          color="info"
          size="small"
          onClick={() => console.log('click')}
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
          disabled
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
