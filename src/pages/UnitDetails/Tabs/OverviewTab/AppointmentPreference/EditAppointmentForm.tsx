import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {TimePicker} from 'components/TimePicker';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {AppointmentFormModel} from 'models/unitForm';
import {setDateTime} from 'utils/datetime';
import Grid from '@mui/material/Grid';
import {useTranslation} from 'react-i18next';
import {useFormatDate} from 'hooks/useFormatDate';
import {UseFormRegister, UseFormSetValue, UseFormWatch} from 'react-hook-form';

interface Props {
  watch: UseFormWatch<AppointmentFormModel>;
  register: UseFormRegister<AppointmentFormModel>;
  setValue: UseFormSetValue<AppointmentFormModel>;
  defaultValues: {openingHour: string; closingHour: string};
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

  return (
    <Grid container spacing={2} component="form">
      <Grid item sm={12} md={12}>
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
            value: watch('appointmentDaysOfWeek'),
            multiple: true,
            ...register('appointmentDaysOfWeek'),
          }}
        />
      </Grid>

      <Grid item sm={12} md={6}>
        <TimePicker
          defaultTime={
            defaultValues.openingHour
              ? setDateTime(new Date(), defaultValues.openingHour)
              : undefined
          }
          getSelectedTime={(time) => {
            setValue(
              'openingHour',
              time instanceof Date && !Number.isNaN(time.valueOf())
                ? formatDate(time, 'HH:mm')
                : '',
            );
          }}
          textFieldProps={{
            label: t('Opening hours start'),
            ...register('openingHour'),
          }}
        />
      </Grid>

      <Grid item sm={12} md={6}>
        <TimePicker
          minTime={
            watch('openingHour')
              ? setDateTime(new Date(), watch('openingHour') as string)
              : undefined
          }
          defaultTime={
            defaultValues.closingHour
              ? setDateTime(new Date(), defaultValues.closingHour)
              : undefined
          }
          getSelectedTime={(time) => {
            setValue(
              'closingHour',
              time instanceof Date && !Number.isNaN(time.valueOf())
                ? formatDate(time, 'HH:mm')
                : '',
            );
          }}
          textFieldProps={{
            label: t('Opening hours end'),
            ...register('closingHour'),
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <FormInput
          props={{
            label: t('Notification Due'),
            placeholder: t('E.g. 5 days'),
            type: 'number',
            inputProps: {min: 0},
            ...register('appointmentNotificationDue'),
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <FormCheckbox
          label={t('Requires Notification')}
          {...register('shouldNotifyCustomer')}
          checked={watch('shouldNotifyCustomer')}
          checkboxProps={{
            ...register('shouldNotifyCustomer'),
          }}
        />
      </Grid>
    </Grid>
  );
};
