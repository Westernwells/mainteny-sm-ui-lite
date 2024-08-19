import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {TimePicker} from 'components/TimePicker';
import {AppointmentFormModel} from 'models/unitForm';
import {setDateTime} from 'utils/datetime';
import Grid from '@mui/material/Grid';
import {useTranslation} from 'react-i18next';
import {useFormatDate} from 'hooks/useFormatDate';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import {UseFormRegister, UseFormSetValue, UseFormWatch} from 'react-hook-form';
import {useState} from 'react';
import {Typography} from '@mui/material';

interface Props {
  watch: UseFormWatch<AppointmentFormModel>;
  register: UseFormRegister<AppointmentFormModel>;
  setValue: UseFormSetValue<AppointmentFormModel>;
  defaultValues: Partial<AppointmentFormModel>;
}

const daysOfWeekOptions = {
  Monday: 'Mo',
  Tuesday: 'Tu',
  Wednesday: 'We',
  Thursday: 'Th',
  Friday: 'Fr',
  Saturday: 'Sa',
  Sunday: 'Su',
};

export const mapDaysOfWeekOptions = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
};

export const EditAppointmentForm = ({
  watch,
  setValue,
  register,
  defaultValues,
}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();

  const [timeError, setTimeError] = useState<string | null>(null);

  const appointmentDaysOfWeek = watch('appointmentDaysOfWeek');
  const openingHour = watch('openingHour');
  const closingHour = watch('closingHour');

  return (
    <Grid container spacing={2} component="form">
      <Grid item sm={12} md={12} xs={12}>
        <FormSelect
          labelId="daysOfWeek-label"
          label="Days of the week"
          options={
            Object.keys(daysOfWeekOptions).map((key) => ({
              label: key,
              value:
                mapDaysOfWeekOptions[key as keyof typeof mapDaysOfWeekOptions],
            })) || []
          }
          selectProps={{
            id: 'daysofWeekSelect',
            value: appointmentDaysOfWeek,
            multiple: true,
            ...register('appointmentDaysOfWeek'),
          }}
        />
      </Grid>

      <Grid item sm={6} md={6} xs={12}>
        <TimePicker
          defaultTime={
            defaultValues.openingHour
              ? setDateTime(new Date(), defaultValues.openingHour)
              : undefined
          }
          maxTime={
            closingHour
              ? setDateTime(new Date(), closingHour as string)
              : undefined
          }
          getSelectedTime={(time) => {
            const formattedTime =
              time instanceof Date && !Number.isNaN(time.valueOf())
                ? formatDate(time, 'HH:mm')
                : '';

            setValue('openingHour', formattedTime);

            if (!closingHour && formattedTime) {
              setTimeError(t('Select opening hours end.'));
            } else {
              setTimeError(null);
            }
          }}
          textFieldProps={{
            label: t('Opening hours start'),
            ...register('openingHour'),
          }}
          inputTestId="opening-hour-start"
          popupTestId="opening-hour-popup"
        />
        {closingHour && !openingHour && timeError && (
          <Typography color="error" variant="body2">
            {timeError}
          </Typography>
        )}
      </Grid>

      <Grid item sm={6} md={6} xs={12}>
        <TimePicker
          minTime={
            openingHour
              ? setDateTime(new Date(), openingHour as string)
              : undefined
          }
          defaultTime={
            defaultValues.closingHour
              ? setDateTime(new Date(), defaultValues.closingHour)
              : undefined
          }
          getSelectedTime={(time) => {
            const formattedTime =
              time instanceof Date && !Number.isNaN(time.valueOf())
                ? formatDate(time, 'HH:mm')
                : '';

            setValue('closingHour', formattedTime);

            if (!openingHour && formattedTime) {
              setTimeError(t('Select opening hours start.'));
            } else {
              setTimeError(null);
            }
          }}
          textFieldProps={{
            label: t('Opening hours end'),
            ...register('closingHour'),
          }}
          inputTestId="opening-hour-end"
          popupTestId="closing-hour-popup"
        />
        {openingHour && !closingHour && timeError && (
          <Typography color="error" variant="body2">
            {timeError}
          </Typography>
        )}
      </Grid>

      <Grid item sm={12} xs={12}>
        <FormInput
          fieldProps={{
            label: t('Notification Due'),
            placeholder: t('E.g. 5 days'),
            type: 'number',
            inputProps: {min: 0},
            ...register('appointmentNotificationDue'),
          }}
        />
      </Grid>

      <Grid item md={6} sm={6} xs={12}>
        <FormControl fullWidth>
          <InputLabel
            size="small"
            shrink
            variant="outlined"
            id="demo-simple-select-label">
            {t('Requires appointment')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            label={t('Requires appointment')}
            size="small"
            defaultValue={watch('requiresAppointment') ? 'true' : 'false'}
            notched
            {...register('requiresAppointment')}>
            <MenuItem value="true">{t('Yes')}</MenuItem>
            <MenuItem value="false">{t('No')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item md={6} sm={6} xs={12}>
        <FormControl fullWidth>
          <InputLabel
            size="small"
            shrink
            variant="outlined"
            id="demo-simple-select-label">
            {t('Requires notification')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            label={t('Requires notification')}
            size="small"
            defaultValue={watch('shouldNotifyCustomer') ? 'true' : 'false'}
            notched
            {...register('shouldNotifyCustomer')}>
            <MenuItem value="true">{t('Yes')}</MenuItem>
            <MenuItem value="false">{t('No')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
