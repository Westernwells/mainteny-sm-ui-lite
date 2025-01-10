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
import {useState, useEffect} from 'react';
import {Alert, Typography} from '@mui/material';
import {ServiceCompanyContactPersonView} from 'models/contacts';
import {useServiceCompanyContactPersons} from 'hooks/reactQuery/useContacts';
import {ContactPersonDropdown} from 'components/ContactPersonDropdown';
import useTheme from '@mui/material/styles/useTheme';

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
  const theme = useTheme();
  const formatDate = useFormatDate();
  const {t} = useTranslation();

  const [timeError, setTimeError] = useState<string | null>(null);

  const appointmentDaysOfWeek = watch('appointmentDaysOfWeek');
  const openingHour = watch('openingHour');
  const closingHour = watch('closingHour');

  const {data: contactPersons} = useServiceCompanyContactPersons({
    pageSize: 100,
  });

  const handleContactChange = (
    contact: ServiceCompanyContactPersonView | null,
  ) => {
    if (contact) {
      setValue('contactPersonId', contact.id);
      setValue(
        'contactPersonName',
        `${contact.userAccount.firstName} ${contact.userAccount.lastName}`,
      );
    } else {
      setValue('contactPersonId', '');
      setValue('contactPersonName', '');
    }
  };

  const validateTimes = (opening?: string, closing?: string) => {
    if (opening && closing) {
      const openingDateTime = setDateTime(new Date(), opening);
      const closingDateTime = setDateTime(new Date(), closing);

      if (closingDateTime <= openingDateTime) {
        setTimeError(t('The end time is before start time.'));
      } else {
        setTimeError(null);
      }
    }
  };

  useEffect(() => {
    validateTimes(openingHour, closingHour);
  }, [openingHour, closingHour, t]);

  return (
    <Grid container spacing={2} component="form">
      <Grid item sm={12} md={12} xs={12} sx={{pb: 2}}>
        <Alert severity="warning">
          <Typography variant="body2" color={theme.palette.info.infoAlert}>
            {t(
              'Please note that when you edit this you are editing the appointment preferences for the unit for all future jobs.',
            )}
          </Typography>
        </Alert>
      </Grid>

      <Grid item sm={4} md={4} xs={12}>
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

      <Grid item sm={4} md={4} xs={12}>
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
              validateTimes(formattedTime, closingHour);
            }
          }}
          textFieldProps={{
            label: t('Opening hours start'),
            size: 'small',
            InputLabelProps: {
              shrink: true,
              required: true,
            },
            inputProps: {
              ...register('openingHour'),
              'data-testid': 'opening-hour-start',
            },
            sx: {
              width: '100%',
            },
          }}
          inputTestId="opening-hour-start"
          popupTestId="opening-hour-start-popup"
        />

        {timeError && (
          <Typography color="error" variant="body2">
            {timeError}
          </Typography>
        )}
      </Grid>

      <Grid item sm={4} md={4} xs={12}>
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
              validateTimes(openingHour, formattedTime);
            }
          }}
          textFieldProps={{
            label: t('Opening hours end'),
            InputLabelProps: {
              shrink: true,
              required: true,
            },
            inputProps: {
              ...register('closingHour'),
              'data-testid': 'opening-hour-end',
            },
            sx: {
              width: '100%',
            },
          }}
          inputTestId="opening-hour-end"
          popupTestId="opening-hour-end-popup"
        />

        {timeError && (
          <Typography color="error" variant="body2">
            {timeError}
          </Typography>
        )}
      </Grid>

      <Grid item md={4} sm={4} xs={12}>
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

      <Grid item md={4} sm={4} xs={12}>
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

      <Grid item md={4} sm={4} xs={12}>
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

      <Grid item md={12} sm={12} xs={12}>
        <ContactPersonDropdown
          contactPersons={contactPersons?.data}
          selectedContactId={watch('contactPersonId')}
          onContactChange={handleContactChange}
        />
      </Grid>

      <Grid item md={12} sm={12} xs={12}>
        <FormInput
          fieldProps={{
            label: t('Description'),
            ...register('description'),
            multiline: true,
            rows: 4,
            sx: {pt: '1em'},
          }}
        />
      </Grid>
    </Grid>
  );
};
