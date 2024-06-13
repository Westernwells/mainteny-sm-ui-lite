import {t} from 'i18next';
import {FormikProps} from 'formik';
import {Box, Grid, Typography} from '@mui/material';
import {FormSelect} from 'components/form/FormSelect';
import {FormRadio} from 'components/form/FormRadio';
import {FormLabel} from 'components/form/FormLabel';
import {formatDate} from 'utils/datetime';
import {SettingsCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<SettingsCompanyFormModel>;
}

export const languages = [
  {
    label: 'English',
    value: 'en-us',
  },
  {
    label: 'German',
    value: 'de-de',
  },
  {
    label: 'Serbian',
    value: 'sr-rs',
  },
  {
    label: 'Italian',
    value: 'it-it',
  },
  {
    label: 'Russian',
    value: 'ru-ru',
  },
  {
    label: 'Danish',
    value: 'da-dk',
  },
  {
    label: 'Georgian',
    value: 'ka-ge',
  },
  {
    label: 'Spanish',
    value: 'es-es',
  },
  {
    label: 'Greek',
    value: 'el-gr',
  },
  {
    label: 'Turkish',
    value: 'tr-tr',
  },
];

export const timeFormats = [
  {
    label: '24h',
    value: 'HOUR_24',
  },
  {
    label: '12h',
    value: 'HOUR_12',
  },
];

export const dateFormats = [
  {
    label: 'DD.MM.YYYY',
    secondaryLabel: formatDate(new Date(), 'dd.MM.yyyy'),
    value: 'dd.MM.yyyy',
  },
  {
    label: 'DD/MM/YYYY',
    secondaryLabel: formatDate(new Date(), 'dd/MM/yyyy'),
    value: 'dd/MM/yyyy',
  },
  {
    label: 'YYYY-MM-DD',
    secondaryLabel: formatDate(new Date(), 'yyyy-MM-dd'),
    value: 'yyyy-MM-dd',
  },
];

export const timeZones = [
  {
    label: 'Europe/Berlin',
    secondaryLabel: 'CEST',
    value: 'Europe/Berlin',
  },
  {
    label: 'Europe/Belfast',
    secondaryLabel: 'BST',
    value: 'Europe/Belfast',
  },
  {
    label: 'Europe/Dublin',
    secondaryLabel: 'IST',
    value: 'Europe/Dublin',
  },
  {
    label: 'Europe/Lisbon',
    secondaryLabel: 'WET',
    value: 'Europe/Lisbon',
  },
  {
    label: 'Europe/London',
    secondaryLabel: 'BST',
    value: 'Europe/London',
  },
  {
    label: 'Asia/Tbilisi',
    secondaryLabel: 'GET',
    value: 'Asia/Tbilisi',
  },
  {
    label: 'Africa/Lagos',
    secondaryLabel: 'WAT',
    value: 'Africa/Lagos',
  },
];

export const EditSettings = ({formik}: Props) => {
  const defaultProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container component="form" spacing={3}>
      <Grid item xs={6}>
        <FormSelect
          labelId="languageSelect-label"
          label="Language"
          options={languages.map(({label, value}) => ({
            label,
            value,
          }))}
          selectProps={{
            id: 'languageSelect',
            value: formik.values.language,
            error: !!(formik.touched.language && formik.errors.language),
            name: 'language',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormSelect
          labelId="dateFormat-label"
          label="Date format"
          options={dateFormats}
          selectProps={{
            id: 'dateFormat',
            value: formik.values.dateFormat,
            error: !!(formik.touched.dateFormat && formik.errors.dateFormat),
            name: 'dateFormat',
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Box>
          <FormLabel text="Time format" />
        </Box>
        {timeFormats.map((timeFormat) => (
          <FormRadio
            key={timeFormat.value}
            value={timeFormat.value}
            checked={timeFormat.value === formik.values.timeFormat}
            name="timeFormat"
            handleChange={(e) =>
              formik.setFieldValue('timeFormat', e.target.value)
            }
            label={
              <Typography variant="body2" component="span">
                {t(timeFormat.label)}
              </Typography>
            }
            radioProps={{size: 'small'}}
          />
        ))}
      </Grid>
      <Grid item xs={12}>
        <FormSelect
          labelId="timeZone-label"
          label="Time zone"
          options={timeZones}
          selectProps={{
            id: 'timeZone',
            value: formik.values.timeZone,
            error: !!(formik.touched.timeZone && formik.errors.timeZone),
            name: 'timeZone',
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};
