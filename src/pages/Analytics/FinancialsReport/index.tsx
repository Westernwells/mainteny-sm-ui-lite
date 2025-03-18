import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {Grid} from '@mui/material';
import {FormSelect} from 'components/form/FormSelect';
import {DatePicker} from 'components/DatePicker';
import {FormatType} from 'models/analytics';
import {FormikProps} from 'formik';
import {ReportsForm} from 'models/reports';

const FORMAT_OPTIONS = [
  {
    label: FormatType.DATEV,
    value: FormatType.DATEV,
  },
  {
    label: FormatType.DF2,
    value: FormatType.DF2,
  },
  {
    label: FormatType.SAGE50,
    value: FormatType.SAGE50,
  },
  {
    label: FormatType.EXCEL,
    value: FormatType.EXCEL,
  },
  {
    label: FormatType.XERO,
    value: FormatType.XERO,
  },
];

type Props = {
  formik: FormikProps<ReportsForm>;
};

export const FinantialsReportForm = ({formik}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Grid container item gap={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color={theme.palette.text.secondary}>
            {t('Period')}
          </Typography>
        </Grid>
        <Grid container item gap={2}>
          <Grid item xs={12} md={3} xl={2}>
            <DatePicker
              defaultDate={formik.values.startDate}
              getSelectedDate={(newValue) => {
                if (newValue) formik.setFieldValue('startDate', newValue);
              }}
              textFieldProps={{
                label: 'From',
                InputLabelProps: {shrink: true},
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={3} xl={2}>
            <DatePicker
              defaultDate={formik.values.endDate}
              getSelectedDate={(newValue) => {
                if (newValue) formik.setFieldValue('endDate', newValue);
              }}
              textFieldProps={{
                label: 'To',
                InputLabelProps: {shrink: true},
                helperText:
                  formik.initialValues.endDate !== formik.values.endDate
                    ? formik.errors.endDate
                    : '',
                error:
                  formik.initialValues.endDate !== formik.values.endDate &&
                  !!formik.errors.endDate,
              }}
              required
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid container item gap={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color={theme.palette.text.secondary}>
            {t('Format type')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3} xl={2}>
          <FormSelect
            labelId="format-label"
            label="Choose format"
            required
            options={FORMAT_OPTIONS}
            selectProps={{
              id: 'formatType',
              value: formik.values.formatType,
              onChange: formik.handleChange,
              name: 'formatType',
              multiple: false,
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
