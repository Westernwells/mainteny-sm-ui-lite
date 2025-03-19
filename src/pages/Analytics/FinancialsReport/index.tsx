import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {FormSelect} from 'components/form/FormSelect';
import {DatePicker} from 'components/DatePicker';
import {FormatType} from 'models/analytics';
import {FormikProps} from 'formik';
import {ReportsForm} from 'models/reports';
import {Box} from '@mui/system';

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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'left',
        flexDirection: 'column',
        gap: 3,
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}>
        <Typography variant="subtitle2" color={theme.palette.text.secondary}>
          {t('Period')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
          }}>
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
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}>
        <Typography variant="subtitle2" color={theme.palette.text.secondary}>
          {t('Format type')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            width: '360px',
          }}>
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
        </Box>
      </Box>
    </Box>
  );
};
