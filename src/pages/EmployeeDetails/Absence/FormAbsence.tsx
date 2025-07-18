import {Sick, WbSunny} from '@mui/icons-material';
import {Avatar, Box, Grid, TextField, Typography} from '@mui/material';
import {FormikProps} from 'formik';
import {Role} from 'models/user';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@mui/material/styles';
import {DatePicker} from 'components/DatePicker';
import {FormSelect} from 'components/form/FormSelect';
import {capitalize} from 'utils/utils';
import {formatDate} from 'utils/datetime';
import {AbsenceForm} from './model';

type Props = {
  name: string;
  roles: Role[];
  formik: FormikProps<AbsenceForm>;
  takenDates: Date[];
};

const FormAbsence = ({formik, roles, name, takenDates}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const shouldDisableStartDate = (date: Date) =>
    takenDates.some((takenDate) => formatDate(takenDate) === formatDate(date));

  const shouldDisableEndDate = (date: Date) => {
    if (formik.values.dateStart && date < formik.values.dateStart) return true;
    return takenDates.some(
      (takenDate) => formatDate(takenDate) === formatDate(date),
    );
  };

  const options = [
    {label: t('1 Day'), value: '1 day'},
    {label: t('Multiple days'), value: 'Multiple days'},
  ];

  return (
    <Box>
      <Box sx={{background: '#edf7fe', padding: '1.250em'}} display="flex">
        <Avatar
          alt=""
          src=""
          variant="circular"
          sx={{
            width: '3.125em',
            height: '3.125em',
            aspectRatio: '1',
            marginRight: '0.625em',
          }}
        />
        <Box display="flex" flexDirection="column">
          <Typography
            variant="subtitle1"
            textAlign="left"
            sx={{color: 'text.primary', fontSize: '16px'}}>
            {name}
          </Typography>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            textAlign="left"
            sx={{fontSize: '0.875em'}}>
            {roles ? `${t(capitalize(roles as string[]))}` : ''}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{color: 'text.primary', margin: '1.5em 0 0.938em 0'}}>
          {t('Select type of absence')}
        </Typography>

        <Grid container spacing="1.500em" justifyContent="space-between">
          <Grid md={6} item>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              onClick={() => formik.setFieldValue('typeAbsence', 'Sick')}
              sx={{
                border: '1px solid',
                borderColor:
                  formik.values.typeAbsence === 'Sick'
                    ? 'primary.main'
                    : '#ecf1f3',
                backgroundColor:
                  formik.values.typeAbsence === 'Sick'
                    ? '#2196F314'
                    : 'transparent',
                width: '100%',
                transition: '0.2s',
                borderRadius: '0.250em',
                padding: '1.25em 0',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: '#2196F314',
                },
              }}>
              <Sick
                htmlColor={
                  formik.values.typeAbsence === 'Sick'
                    ? theme.palette.primary.main
                    : theme.palette.success.dark
                }
              />
              <Typography sx={{marginTop: '0.625em'}}> {t('Sick')}</Typography>
            </Box>
          </Grid>
          <Grid md={6} item>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              onClick={() => formik.setFieldValue('typeAbsence', 'Holiday')}
              sx={{
                border: '1px solid',
                borderColor:
                  formik.values.typeAbsence === 'Holiday'
                    ? 'primary.main'
                    : '#ecf1f3',
                width: '100%',
                transition: '0.2s',
                borderRadius: '0.250em',
                padding: '1.25em 0',
                cursor: 'pointer',
                backgroundColor:
                  formik.values.typeAbsence === 'Holiday'
                    ? '#2196F314'
                    : 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: '#2196F314',
                },
              }}>
              <WbSunny
                htmlColor={
                  formik.values.typeAbsence === 'Holiday'
                    ? theme.palette.primary.main
                    : theme.palette.amber.main
                }
              />
              <Typography sx={{marginTop: '0.625em'}}>
                {t('Holiday')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{color: 'text.primary', margin: '1.5em 0'}}>
          {t('Select duration')}
        </Typography>
        <FormSelect
          labelId="dateFormat-label"
          label={t('Duration')}
          options={options.map(({label, value}) => ({
            label,
            value,
          }))}
          selectProps={{
            id: 'duration',
            value: formik.values.duration,
            error: !!(formik.touched.duration && formik.errors.duration),
            name: 'duration',
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          containerStyles={{marginBottom: '1.5em'}}
        />
        {formik.values.duration === '1 day' && (
          <DatePicker
            defaultDate={formik.values.date}
            getSelectedDate={(newValue) => {
              if (newValue) formik.setFieldValue('date', newValue);
            }}
            textFieldProps={{
              label: t('Date'),
              name: 'date',
              helperText:
                formik.errors.date && formik.touched.date
                  ? formik.errors.date
                  : '',
              error: !!(formik.touched.date && formik.errors.date),
            }}
            containerStyles={{mb: '1.5em'}}
            required
            shouldDisableDate={shouldDisableStartDate}
            inputTestId="date-input"
            popupTestId="date-calendar-popup"
          />
        )}
        {formik.values.duration === 'Multiple days' && (
          <>
            <DatePicker
              defaultDate={formik.values.dateStart}
              getSelectedDate={(newValue) => {
                if (newValue) formik.setFieldValue('dateStart', newValue);
              }}
              textFieldProps={{
                label: t('Start Date'),
                name: 'dateStart',
                helperText:
                  formik.errors.dateStart && formik.touched.dateStart
                    ? formik.errors.dateStart
                    : '',
                error: !!(formik.touched.dateStart && formik.errors.dateStart),
              }}
              maxDate={
                formik.values.dateEnd
                  ? new Date(formik.values.dateEnd)
                  : undefined
              }
              containerStyles={{mb: '1.5em'}}
              shouldDisableDate={shouldDisableStartDate}
              required
              inputTestId="start-date-input"
              popupTestId="start-date-calendar-popup"
            />
            <DatePicker
              defaultDate={formik.values.dateEnd}
              getSelectedDate={(newValue) => {
                if (newValue) formik.setFieldValue('dateEnd', newValue);
              }}
              textFieldProps={{
                label: t('End Date'),
                name: 'dateEnd',
                helperText:
                  formik.errors.dateEnd && formik.touched.dateEnd
                    ? formik.errors.dateEnd
                    : '',
                error: !!(formik.touched.dateEnd && formik.errors.dateEnd),
              }}
              minDate={
                formik.values.dateStart
                  ? new Date(formik.values.dateStart)
                  : undefined
              }
              containerStyles={{mb: '1.5em'}}
              shouldDisableDate={shouldDisableEndDate}
              required
              inputTestId="end-date-input"
              popupTestId="end-date-calendar-popup"
            />
          </>
        )}
        <TextField
          label={t('Reason')}
          multiline
          rows={5}
          placeholder={t('Enter reason')}
          variant="outlined"
          value={formik.values.notes}
          onChange={(e) => formik.setFieldValue('notes', e.target.value)}
          InputLabelProps={{shrink: true}}
          sx={{width: '100%', mt: '0.5em'}}
        />
      </Box>
    </Box>
  );
};

export default FormAbsence;
