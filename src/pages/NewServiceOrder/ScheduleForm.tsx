import {useEffect} from 'react';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import {Box, Typography} from '@mui/material';
import {DateRange} from '@mui/x-date-pickers-pro';
import {TimePicker} from 'components/TimePicker';
import DatePickerRange from 'components/DatePickerRange';
import {ScheduleTechnicianForm} from './models';

interface Props {
  getScheduleFormValues: (value: ScheduleTechnicianForm) => void;
  defaultValues?: ScheduleTechnicianForm;
}

export const ScheduleForm = ({getScheduleFormValues, defaultValues}: Props) => {
  const {t} = useTranslation();
  const formik = useFormik<
    ScheduleTechnicianForm & {startDate?: Date; endDate?: Date}
  >({
    initialValues: {
      startDate: defaultValues?.startDate || undefined,
      startTime: defaultValues?.startTime || undefined,
      endDate: defaultValues?.endDate || undefined,
      endTime: defaultValues?.endTime || undefined,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    getScheduleFormValues({
      ...formik.values,
    });
  }, [formik.values]);

  const clearDateSelection = () => {
    formik.setValues({
      ...formik.values,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const setDate = (date: DateRange<Date>) => {
    formik.setValues({
      ...formik.values,
      startDate: date?.[0] || undefined,
      endDate: date?.[1] || date?.[0] || undefined,
    });
  };

  const setStartTime = (time: Date) => {
    formik.setValues({
      ...formik.values,
      startTime: time,
      endTime: new Date(time.getTime() + 60 * 60000),
    });
  };

  const setEndTime = (time: Date) => {
    formik.setValues({
      ...formik.values,
      endTime: time,
    });
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5} maxWidth="40rem">
      <Box>
        <Typography variant="subtitle2">{t('Schedule the job for')}</Typography>
        <DatePickerRange
          defaultDate={[
            formik.values.startDate || null,
            formik.values.endDate || null,
          ]}
          getSelectedDate={setDate}
          textFieldProps={{
            label: '',
            sx: {
              width: '100%',
            },
          }}
          onClear={clearDateSelection}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2">{t('From')}</Typography>
        <TimePicker
          defaultTime={formik.values.startTime}
          containerStyles={{pt: 1}}
          getSelectedTime={(time) => {
            if (time && !Number.isNaN(time.getTime())) {
              setStartTime(time);
            }
          }}
          textFieldProps={{
            label: '',
            name: 'startTime',
          }}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2">{t('To')}</Typography>
        <TimePicker
          defaultTime={formik.values.endTime}
          containerStyles={{pt: 1}}
          minTime={formik.values.startTime}
          getSelectedTime={(time) => {
            if (time && !Number.isNaN(time.getTime())) {
              setEndTime(time);
            }
          }}
          textFieldProps={{
            label: '',
            name: 'endTime',
          }}
        />
      </Box>
    </Box>
  );
};
