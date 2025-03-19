import {FormikProps} from 'formik';
import {ReportsForm} from 'models/reports';
import Typography from '@mui/material/Typography';
import {Box, Checkbox} from '@mui/material';
import React, {ChangeEvent, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Switch from 'components/Switch/index';
import {FormatType} from 'models/analytics';

const OPTIONS = {
  switches: {
    includeInvoicesData: {labelKey: 'Invoices', key: 'invoices'},
    includePaymentsData: {labelKey: 'Payment', key: 'payment'},
    includePurchaseInvoicesData: {
      labelKey: 'Purchase invoices',
      key: 'purchase-invoices',
    },
  },
  checkboxes: {
    includePreviouslyDownloadedData: {
      labelKey: 'Include previously downloaded data',
      key: 'previously-downloaded-data',
    },
    includePDFDocuments: {
      labelKey: 'Include PDF documents',
      key: 'pdf-documents',
    },
  },
};

type Props = {
  disabled: boolean;
  formik: FormikProps<ReportsForm>;
};

const IncludesSection = ({disabled, formik}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const handleToggle =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
      formik.setFieldValue(key, event.target.checked);
    };

  const disableSwitches =
    disabled || formik.values.formatType !== FormatType.DATEV;

  const disableCheckboxes =
    disabled ||
    ![FormatType.DATEV, FormatType.XERO].includes(formik.values.formatType);

  // reset on type change
  useEffect(() => {
    if (disableSwitches) {
      formik.setFieldValue('includePaymentsData', false);
      formik.setFieldValue('includeInvoicesData', false);
      formik.setFieldValue('includePurchaseInvoicesData', false);
    }
    if (disableCheckboxes) {
      formik.setFieldValue('includePDFDocuments', false);
      formik.setFieldValue('includePreviouslyDownloadedData', false);
    }
  }, [formik.values.formatType]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
      gap={theme.spacing(1.5)}>
      <Typography variant="subtitle2" color={theme.palette.text.secondary}>
        {t('Include')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        {Object.entries(OPTIONS.switches).map((entry) => {
          const formKey = entry[0];
          const {labelKey, key} = entry[1];

          return (
            <Box
              key={`switch-option-${key}-container`}
              data-testid={`switch-option-${key}-container`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                gap: 1,
              }}>
              <Switch
                disabled={disableSwitches}
                testId={`switch-option-${key}`} // @ts-ignore
                value={!disableSwitches && formik.values[formKey]}
                onChange={handleToggle(formKey)}
              />
              <Typography
                variant="body1"
                sx={{
                  color: !disableSwitches ? 'text.primary' : 'text.secondary',
                }}>
                {t(labelKey)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}>
        {Object.entries(OPTIONS.checkboxes).map((entry) => {
          const formKey = entry[0];
          const {labelKey, key} = entry[1];

          return (
            <Box
              key={`checkbox-option-${key}-container`}
              data-testid={`checkbox-option-${key}-container`}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                padding: '8px',
              }}>
              <Checkbox
                data-testid={`checkbox-option-${key}`} // @ts-ignore
                checked={!disableCheckboxes && formik.values[formKey]}
                onChange={handleToggle(formKey)}
                sx={{
                  padding: 0,
                }}
                disabled={disableCheckboxes}
                disableRipple
                disableTouchRipple
              />
              <Typography
                variant="body1"
                sx={{
                  color: !disableCheckboxes ? 'text.primary' : 'text.secondary',
                }}>
                {t(labelKey)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default IncludesSection;
