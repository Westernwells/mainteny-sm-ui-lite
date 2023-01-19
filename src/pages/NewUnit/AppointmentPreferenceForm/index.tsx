import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, useFormik} from 'formik';
import {AppointmentFormModel} from 'models/unitForm';
import {useEffect} from 'react';
import {PageCard} from 'components/PageCard';
import {FormSelect} from 'components/form/FormSelect';
import {TimePicker} from 'components/TimePicker';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {setDateTime} from 'utils/datetime';
import {useTranslation} from 'react-i18next';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  getAppointmentFormErrors?: (val: FormikErrors<AppointmentFormModel>) => void;
  getAppointmentFormValues?: (val: AppointmentFormModel) => void;
  initialValues?: AppointmentFormModel;
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

export const AppointmentPreferenceForm = ({
  getAppointmentFormErrors,
  getAppointmentFormValues,
  initialValues,
}: Props) => {
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const formik = useFormik<AppointmentFormModel>({
    initialValues: {
      appointmentDaysOfWeek: initialValues?.appointmentDaysOfWeek || [],
      openingHour: initialValues?.openingHour || '',
      closingHour: initialValues?.closingHour || '',
      shouldNotifyCustomer: initialValues?.shouldNotifyCustomer || false,
      appointmentNotificationDue:
        initialValues?.appointmentNotificationDue || 1,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (getAppointmentFormErrors) {
      getAppointmentFormErrors(formik.errors);
    }

    if (getAppointmentFormValues) {
      getAppointmentFormValues(formik.values);
    }
  }, [formik]);

  return (
    <PageCard
      headerLabel="Appointment Preferences"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={4}>
            <FormSelect
              labelId="daysOfWeek-label"
              label={t('Days of the week')}
              options={Object.keys(daysOfWeekOptions).map((key) => ({
                label: key,
                value: daysOfWeekOptions[key as keyof typeof daysOfWeekOptions],
              }))}
              selectProps={{
                id: 'daysofWeekSelect',
                value: formik.values.appointmentDaysOfWeek,
                onChange: formik.handleChange,
                name: 'appointmentDaysOfWeek',
                multiple: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <TimePicker
              defaultTime={
                formik.values.openingHour
                  ? setDateTime(new Date(), formik.values.openingHour)
                  : undefined
              }
              getSelectedTime={(time) => {
                formik.setFieldValue(
                  'openingHour',
                  time instanceof Date && !Number.isNaN(time.valueOf())
                    ? formatDate(time, 'HH:mm')
                    : '',
                );
              }}
              textFieldProps={{
                label: t('Opening Hour'),
                name: 'openingHour',

                onBlur: formik.handleBlur,
                helperText:
                  formik.errors.openingHour && formik.touched.openingHour
                    ? formik.errors.openingHour
                    : '',
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <TimePicker
              defaultTime={
                formik.values.closingHour
                  ? setDateTime(new Date(), formik.values.closingHour)
                  : undefined
              }
              getSelectedTime={(time) => {
                formik.setFieldValue(
                  'closingHour',
                  time instanceof Date && !Number.isNaN(time.valueOf())
                    ? formatDate(time, 'HH:mm')
                    : '',
                );
              }}
              textFieldProps={{
                label: t('Closing Hour'),
                name: 'closingHour',

                onBlur: formik.handleBlur,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <FormInput
              props={{
                label: 'Notification Due',
                name: 'appointmentNotificationDue',
                placeholder: 'E.g. 5 days',
                type: 'number',
                inputProps: {min: 0},
                value: formik.values.appointmentNotificationDue,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <FormCheckbox
              checked={formik.values.shouldNotifyCustomer}
              name="shouldNotifyCustomer"
              handleChange={formik.handleChange}
              label={t('Requires Notification')}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
