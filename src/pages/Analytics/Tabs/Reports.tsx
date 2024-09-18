import React, {useEffect, useMemo, useState} from 'react';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {MonetizationOn, Download, AccessTimeFilled} from '@mui/icons-material';
import {
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Box,
  Grid,
} from '@mui/material';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {InfoCard} from 'components/InfoCard';
import {FormSelect} from 'components/form/FormSelect';
import {DatePicker} from 'components/DatePicker';
import {Button} from 'components/Button';
import {FormatType, ReportType} from 'models/analytics';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useEmployeeWorkingHoursCSV,
  useEmployeeWorkingHoursXLSX,
  useInvoicesDatev,
  useInvoicesXLSX,
  useInvoicesXero,
  useInvoicesSage50,
  useInvoicesDf2,
  useInvoicesPdfUrls,
} from 'hooks/reactQuery/useAnalytics';
import {convertToText} from 'utils/utils';
import {toRestDate} from 'utils/datetime';
import {FormCheckbox} from 'components/form/FormCheckbox';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {downloadAndZipFiles} from 'utils/download';

const validationSchema = Yup.object().shape({
  reportType: Yup.string()
    .oneOf(Object.values(ReportType))
    .required('Report type is required'),
  formatType: Yup.string()
    .oneOf(Object.values(FormatType))
    .required('Format type is required'),
  startDate: Yup.date().nullable().required('Start date is required'),
  endDate: Yup.date()
    .nullable()
    .when('startDate', (startDate, schema) => {
      if (startDate) {
        const dayAfter = new Date(startDate);
        dayAfter.setDate(dayAfter.getDate() + 182);
        return schema.max(
          dayAfter,
          'Max time range exceeded, the max time range is 6 months (183 days)',
        );
      }
      return schema;
    })
    .required('End date is required'),
});

interface Option {
  label: string;
  value: string;
  icon: JSX.Element;
}

export const Reports = () => {
  const {t, i18n} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;

  const formik = useFormik({
    validateOnMount: true,
    initialValues: {
      reportType: ReportType.FINANCIALS,
      formatType: FormatType.XERO,
      startDate: null,
      endDate: null,
      excludePreviouslyDownloadedData: false,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const reportParams = {
    startDate: toRestDate(formik.values.startDate ?? new Date()),
    endDate: toRestDate(formik.values.endDate ?? new Date()),
  };

  const getEmployeeWorkingHoursCSV = useEmployeeWorkingHoursCSV({
    serviceCompanyId,
    ...reportParams,
  });
  const getEmployeeWorkingHoursXLSX = useEmployeeWorkingHoursXLSX({
    serviceCompanyId,
    ...reportParams,
  });
  const getInvoicesDatev = useInvoicesDatev(serviceCompanyId, {
    ...reportParams,
    full: !formik.values.excludePreviouslyDownloadedData,
  });
  const getInvoicesXero = useInvoicesXero(serviceCompanyId, reportParams);
  const getInvoicesXLSX = useInvoicesXLSX(serviceCompanyId, reportParams);
  const getInvoicesSage50 = useInvoicesSage50(serviceCompanyId, reportParams);
  const getInvoicesDf2 = useInvoicesDf2(serviceCompanyId, reportParams);
  const getInvoicesPdfPaths = useInvoicesPdfUrls(
    serviceCompanyId,
    reportParams,
  );

  const [pdfPaths, setPdfPaths] = useState<string[]>([]);
  const {refetch: refetchDownloadUrl} = useDownloadUrl(pdfPaths || []);

  useEffect(() => {
    const downloadFiles = async () => {
      const downloadUrlsResult = await refetchDownloadUrl();
      const pdfUrlsArray = Object.entries(downloadUrlsResult?.data || {});

      if (pdfUrlsArray.length) {
        await downloadAndZipFiles(pdfUrlsArray, 'invoice_pdfs');
        setPdfPaths([]);
      }
    };

    if (
      (formik.values.formatType === FormatType.DATEV_WITH_PDF ||
        formik.values.formatType === FormatType.EXCEL_WITH_PDF) &&
      pdfPaths.length
    ) {
      downloadFiles();
    }
  }, [pdfPaths]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const {formatType, reportType} = formik.values;

    if (reportType === ReportType.WORK_HOURS) {
      if (formatType === FormatType.CSV)
        return getEmployeeWorkingHoursCSV.refetch();
      if (formatType === FormatType.EXCEL)
        return getEmployeeWorkingHoursXLSX.refetch();
    } else if (reportType === ReportType.FINANCIALS) {
      if (formatType === FormatType.DATEV) return getInvoicesDatev.refetch();
      if (formatType === FormatType.XERO) return getInvoicesXero.refetch();
      if (formatType === FormatType.EXCEL) return getInvoicesXLSX.refetch();
      if (formatType === FormatType.SAGE50) return getInvoicesSage50.refetch();
      if (formatType === FormatType.DF2) return getInvoicesDf2.refetch();
      if (
        formatType === FormatType.DATEV_WITH_PDF ||
        formatType === FormatType.EXCEL_WITH_PDF
      ) {
        if (formatType === FormatType.EXCEL_WITH_PDF) {
          await getInvoicesXLSX.refetch();
        } else if (formatType === FormatType.DATEV_WITH_PDF) {
          await getInvoicesDatev.refetch();
        }

        const files = await getInvoicesPdfPaths.refetch();
        setPdfPaths(files.data);
      }
    }
  };

  const isDownloading =
    getEmployeeWorkingHoursCSV.isFetching ||
    getEmployeeWorkingHoursXLSX.isFetching ||
    getInvoicesDatev.isFetching ||
    getInvoicesXero.isFetching ||
    getInvoicesXLSX.isFetching ||
    getInvoicesDf2.isFetching ||
    getInvoicesSage50.isFetching ||
    getInvoicesPdfPaths.isFetching;

  const renderReportType = (option: Option, index: number) => {
    const selected = formik.values.reportType === option.value;
    const textColor = selected ? 'white' : theme.palette.text.primary;
    const iconColor = selected ? 'white' : theme.palette.action.active;
    const backgroundColor = selected ? theme.palette.primary.main : 'white';

    return (
      <Card
        key={index}
        onClick={() => formik.setFieldValue('reportType', option.value)}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          backgroundColor,
          boxShadow: '0px 4px 15px #90909033',
          border: `1px solid ${theme.palette.background.default}`,
          py: 5,
          px: 6,
        }}>
        <CardContent sx={{color: textColor, p: 0, '&:last-child': {pb: 0}}}>
          <FormControlLabel
            control={
              <Radio
                checked={selected}
                style={{display: 'none'}}
                color="primary"
              />
            }
            disableTypography
            label={
              <Grid
                container
                gap={1}
                alignItems="center"
                justifyContent="center">
                <Box sx={{color: iconColor, display: 'flex'}}>
                  {option.icon}
                </Box>
                <Typography variant="h5">{t(option.label)}</Typography>
              </Grid>
            }
            value={option.value}
            sx={{m: 0}}
          />
        </CardContent>
      </Card>
    );
  };

  const reportTypes: Option[] = [
    {
      label: convertToText(ReportType.FINANCIALS),
      value: ReportType.FINANCIALS,
      icon: <MonetizationOn />,
    },
    {
      label: convertToText(ReportType.WORK_HOURS),
      value: ReportType.WORK_HOURS,
      icon: <AccessTimeFilled />,
    },
  ];

  const formatOptions = useMemo(() => {
    if (formik.values.reportType === ReportType.FINANCIALS) {
      return [
        {
          label: FormatType.XERO,
          value: FormatType.XERO,
        },
        {
          label: FormatType.DATEV,
          value: FormatType.DATEV,
        },
        {
          label: FormatType.EXCEL,
          value: FormatType.EXCEL,
        },
        {
          label: FormatType.DATEV_WITH_PDF,
          value: FormatType.DATEV_WITH_PDF,
        },
        {
          label: FormatType.EXCEL_WITH_PDF,
          value: FormatType.EXCEL_WITH_PDF,
        },
        {
          label: FormatType.SAGE50,
          value: FormatType.SAGE50,
        },
        {
          label: FormatType.DF2,
          value: FormatType.DF2,
        },
      ];
    }
    return [
      {
        label: FormatType.EXCEL,
        value: FormatType.EXCEL,
      },
      {
        label: FormatType.CSV,
        value: FormatType.CSV,
      },
    ];
  }, [formik.values.reportType]);

  useEffect(() => {
    if (formik.values.reportType === ReportType.FINANCIALS) {
      formik.setFieldValue('formatType', FormatType.XERO);
    } else {
      formik.setFieldValue('formatType', FormatType.EXCEL);
    }
  }, [formik.values.reportType]);

  return (
    <InfoCard
      header={<Typography variant="subtitle1">{t('Report config')}</Typography>}
      showHeaderBackground
      containerStyles={{
        mt: 1.5,
      }}>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12} pb={2}>
            <Typography
              variant="subtitle2"
              color={theme.palette.text.secondary}>
              {t('Report types')}
            </Typography>
            <Box display="flex" flexDirection="row" gap={2} pt={2}>
              {reportTypes.map(renderReportType)}
            </Box>
          </Grid>

          <Grid container item gap={2}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color={theme.palette.text.secondary}>
                {t('Format type')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3} xl={2}>
              <FormSelect
                labelId="format-label"
                label="Choose format"
                required
                options={formatOptions}
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

          <Grid container item gap={2}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color={theme.palette.text.secondary}>
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
                    label: i18n.language === 'de-de' ? 'Bis' : 'To',
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

          {formik?.values?.reportType === ReportType.FINANCIALS &&
            formik?.values?.formatType === FormatType.DATEV && (
              <Grid item xs={12}>
                <FormCheckbox
                  value={formik.values.excludePreviouslyDownloadedData.toString()}
                  name="excludePreviouslyDownloadedData"
                  handleChange={formik.handleChange}
                  label={t('Exclude previously downloaded data')}
                />
              </Grid>
            )}

          <Grid item xs={12} textAlign="end">
            <Button
              label={isDownloading ? `${t('Downloading')}...` : t('Download')}
              buttonProps={{
                type: 'submit',
                variant: 'contained',
                size: 'large',
                sx: {mt: 2},
                startIcon: <Download />,
                disabled: !formik.isValid || isDownloading,
              }}
            />
          </Grid>
        </Grid>
      </form>
    </InfoCard>
  );
};
