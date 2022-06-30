import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import TimePicker from '@mui/lab/TimePicker';
import {TimeWindowType} from 'models/misc';
import {Button} from 'components/Button';
import {convertToMacro, convertToText} from 'utils/utils';
import {Shift} from './model';

type Props = {
  values: any;
  setFieldValue: any;
};

export const SelectShift = ({values, setFieldValue}: Props) => {
  const {t} = useTranslation();
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

  const [shifts, setShifts] = useState<Shift<Date | null>[]>(
    values.shifts && values.shifts.length
      ? values.shifts.map((item: any) => ({
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
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            sx={{width: '14em'}}>
            <TimePicker
              label={t('Start Time')}
              ampm={false}
              value={shift.fromTime}
              disabled={index < shifts.length - 1 && index === 0}
              onChange={(newValue) => {
                const oldShifts = shifts.filter((item) => item !== shift);
                const newShift = shift;
                newShift.fromTime = newValue;
                setShifts([...oldShifts, newShift]);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{width: '6.875em'}} />
              )}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label={t('End Time')}
              ampm={false}
              value={shift.toTime}
              disabled={index < shifts.length - 1 && index === 0}
              onChange={(newValue) => {
                const oldShifts = shifts.filter((item) => item !== shift);
                const newShift = shift;
                newShift.toTime = newValue;
                setShifts([...oldShifts, newShift]);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{width: '6.875em'}} />
              )}
            />
          </LocalizationProvider>

          <FormControl sx={{width: '14em'}}>
            <InputLabel
              id="shiftDaySelect-label"
              sx={{
                bgcolor: 'white',
                color: 'text.primary',
                paddingInline: '.5em',
              }}
              disabled={index < shifts.length - 1 && index === 0}>
              {t('Type')}
            </InputLabel>
            <Select
              labelId="shiftDaySelect-label"
              id="shiftDaySelect"
              value={shift.type}
              label="Type"
              size="small"
              disabled={index < shifts.length - 1 && index === 0}
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
                  {t(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ))}

      <Box mt="1em">
        <Button
          label="+ Add"
          buttonProps={{
            variant: 'outlined',
            color: 'info',

            onClick: handleAddShift,
            disabled: shifts.length === workDays.length,
            sx: {
              mr: '1em',
              borderColor: 'info.main',
              bgcolor: 'transparent',
            },
          }}
        />
        {shifts.length > 1 && (
          <Button
            label="Remove"
            buttonProps={{
              variant: 'outlined',
              color: 'error',
              onClick: handleRemoveShift,
              disabled: shifts.length === 1,
              sx: {
                mr: '1em',
                borderColor: 'error.main',
                bgcolor: 'transparent',
              },
            }}
          />
        )}
      </Box>
    </>
  );
};
