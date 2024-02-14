import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {Box} from '@mui/material';

import {FormSelect} from 'components/form/FormSelect';
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
    label: 'dd.MM.yyyy',
    value: 'dd.MM.yyyy',
  },
  {
    label: 'dd/MM/yyyy',
    value: 'dd/MM/yyyy',
  },
  {
    label: 'yyyy-MM-dd',
    value: 'yyyy-MM-dd',
  },
];

export const timeZones = [
  {
    label: 'Europe/Berlin',
    value: 'Europe/Berlin',
  },
  {
    label: 'Europe/Belfast',
    value: 'Europe/Belfast',
  },
  {
    label: 'Europe/Dublin',
    value: 'Europe/Dublin',
  },
  {
    label: 'Europe/Lisbon',
    value: 'Europe/Lisbon',
  },
  {
    label: 'Europe/London',
    value: 'Europe/London',
  },
  {
    label: 'Europe/Tbilisi',
    value: 'Europe/Tbilisi',
  },
  {
    label: 'Africa/Lagos',
    value: 'Africa/Lagos',
  },
];

export const EditSettings = ({formik}: Props) => {
  const defaultProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
      <Grid item xs={12}>
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
      <Grid item xs={12}>
        <Box marginTop="1em">
          <FormSelect
            labelId="dateFormat-label"
            label="Date Format"
            options={dateFormats.map(({label, value}) => ({
              label,
              value,
            }))}
            selectProps={{
              id: 'dateFormat',
              value: formik.values.dateFormat,
              error: !!(formik.touched.dateFormat && formik.errors.dateFormat),
              name: 'dateFormat',
              ...defaultProps,
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box marginTop="1em">
          <FormSelect
            labelId="timeFormat-label"
            label="Time Format"
            options={timeFormats.map(({label, value}) => ({
              label,
              value,
            }))}
            selectProps={{
              id: 'timeFormat',
              value: formik.values.timeFormat,
              error: !!(formik.touched.timeFormat && formik.errors.timeFormat),
              name: 'timeFormat',
              ...defaultProps,
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box marginTop="1em">
          <FormSelect
            labelId="timeZone-label"
            label="Time Zone"
            options={timeZones.map(({label, value}) => ({
              label,
              value,
            }))}
            selectProps={{
              id: 'timeZone',
              value: formik.values.timeZone,
              error: !!(formik.touched.timeZone && formik.errors.timeZone),
              name: 'timeZone',
              ...defaultProps,
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};
