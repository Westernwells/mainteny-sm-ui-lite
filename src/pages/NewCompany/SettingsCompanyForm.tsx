import {useEffect} from 'react';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {Typography} from '@mui/material';

import {PageCard} from 'components/PageCard';
import {Switch} from 'components/Switch';
import {FormSelect} from 'components/form/FormSelect';
import {FormInput} from 'components/form/FormInput';
import {DispatchStrategy} from 'models/misc';
import {convertToText} from 'utils/utils';
import {
  dateFormats,
  languages,
  timeFormats,
  timeZones,
} from 'pages/CompanyDetails/Settings/EditSettings';
import {getCurrencySymbol} from 'utils/currency';
import {SettingsFormModel} from './model';

interface Props {
  getSettingsCompanyFormErrors?: (val: FormikErrors<SettingsFormModel>) => void;
  getSettingsCompanyFormValues?: (val: SettingsFormModel) => void;
  initialValues: SettingsFormModel;
}

const validationSchema = Yup.object().shape({
  language: Yup.string().required('Language is required'),
  dateFormat: Yup.string().required('Date format is required'),
  timeFormat: Yup.string().required('Time format is required'),
  timeZone: Yup.string().required('Time zone is required'),
  companyDispatchStrategy: Yup.string().required(
    'Company dispatch strategy is required',
  ),
  totalYearlyVacationDaysAllowed: Yup.number()
    .required('Yearly vacation days is required')
    .min(0, 'Minimum 0'),
});

export const SettingsCompanyForm = ({
  getSettingsCompanyFormErrors,
  getSettingsCompanyFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<SettingsFormModel>({
    onSubmit: () => {},
    validationSchema,
    initialValues: {
      language: initialValues?.language || '',
      dateFormat: initialValues?.dateFormat || '',
      timeFormat: initialValues?.timeFormat || '',
      timeZone: initialValues?.timeZone || '',
      companyDispatchStrategy: initialValues?.companyDispatchStrategy || '',
      nightlyShuffleEnabled: initialValues?.nightlyShuffleEnabled || false,
      totalYearlyVacationDaysAllowed:
        initialValues?.totalYearlyVacationDaysAllowed || '',
      currency: initialValues.currency ?? 'EUR',
    },
    isInitialValid: false,
  });

  useEffect(() => {
    if (getSettingsCompanyFormErrors) {
      getSettingsCompanyFormErrors(formik.errors);
    }

    if (getSettingsCompanyFormValues) {
      getSettingsCompanyFormValues(formik.values);
    }
  }, [formik]);

  const defaultProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <PageCard
      headerLabel="Settings"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item xs={5}>
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
              errorText={formik.touched.language && formik.errors.language}
              required
            />
          </Grid>
          <Grid item xs={5}>
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
                error: !!(
                  formik.touched.dateFormat && formik.errors.dateFormat
                ),
                name: 'dateFormat',
                ...defaultProps,
              }}
              errorText={formik.touched.dateFormat && formik.errors.dateFormat}
              required
            />
          </Grid>
          <Grid item xs={5}>
            <Box>
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
                  error: !!(
                    formik.touched.timeFormat && formik.errors.timeFormat
                  ),
                  name: 'timeFormat',
                  ...defaultProps,
                }}
                errorText={
                  formik.touched.timeFormat && formik.errors.timeFormat
                }
                required
              />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box>
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
                errorText={formik.touched.timeZone && formik.errors.timeZone}
                required
              />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box>
              <FormSelect
                labelId="companyDispatchStrategy-label"
                label="Dispatching Strategy"
                options={Object.keys(DispatchStrategy).map((item) => ({
                  label: convertToText(item),
                  value: item,
                }))}
                selectProps={{
                  id: 'companyDispatchStrategy',
                  value: formik.values.companyDispatchStrategy,
                  error: !!(
                    formik.touched.companyDispatchStrategy &&
                    formik.errors.companyDispatchStrategy
                  ),
                  name: 'companyDispatchStrategy',
                  ...defaultProps,
                }}
                errorText={
                  formik.touched.companyDispatchStrategy &&
                  formik.errors.companyDispatchStrategy
                }
                required
              />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography variant="body1" sx={{color: 'text.primary'}}>
                Daily Dispatch (Nightly Shuffle)
              </Typography>
              <Switch
                value={formik.values.nightlyShuffleEnabled}
                onChanged={(value) =>
                  formik.setFieldValue('nightlyShuffleEnabled', value)
                }
              />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <FormInput
              fieldProps={{
                size: 'small',
                placeholder: 'e.g. 30',
                label: 'Yearly Vacation Days',
                name: 'totalYearlyVacationDaysAllowed',
                type: 'number',
                helperText:
                  formik.touched.totalYearlyVacationDaysAllowed &&
                  formik.errors.totalYearlyVacationDaysAllowed,
                error:
                  !!formik.errors.totalYearlyVacationDaysAllowed &&
                  formik.touched.totalYearlyVacationDaysAllowed,
                required: true,
                value: formik.values.totalYearlyVacationDaysAllowed,
                InputLabelProps: {shrink: true},
                inputProps: {min: 0},
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <Box>
              <FormSelect
                labelId="currency-label"
                label="Currency"
                options={Object.entries(getCurrencySymbol).map(([label]) => ({
                  label,
                  value: label,
                }))}
                selectProps={{
                  id: 'currency',
                  value: formik.values.currency,
                  error: !!(formik.touched.currency && formik.errors.currency),
                  name: 'currency',
                  ...defaultProps,
                }}
                errorText={formik.touched.currency && formik.errors.currency}
                required
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
