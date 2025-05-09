import React, {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import {AccessTimeFilled, Download, MonetizationOn} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Radio,
} from '@mui/material';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {InfoCard} from 'components/InfoCard';
import {Button} from 'components/Button';
import {FormatType, ReportType} from 'models/analytics';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useEmployeeWorkingHoursCSV,
  useEmployeeWorkingHoursXLSX,
  useInvoicesDatev,
  useInvoicesDf2,
  useInvoicesPdfUrls,
  useInvoicesSage50,
  useInvoicesXero,
  useInvoicesXLSX,
} from 'hooks/reactQuery/useAnalytics';
import {convertToText} from 'utils/utils';
import {toRestDate} from 'utils/datetime';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {downloadAndZipFiles} from 'utils/download';
import {GenericReportForm} from 'pages/Analytics/GenericReport';
import {FinantialsReportForm} from 'pages/Analytics/FinancialsReport';
import {ReportsForm} from 'models/reports';
import IncludesSection from 'pages/Analytics/IncludesSection';

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
    .when(['startDate'], ([startDate], schema) => {
      if (startDate) {
        const dayAfter = new Date(startDate);
        dayAfter.setDate(dayAfter.getDate() + 90);
        return schema.max(
          dayAfter,
          'Max time range exceeded, the max time range is 90 days',
        );
      }
      return schema;
    })
    .required('End date is required'),
  includePDFDocuments: Yup.boolean().default(false),
  includePreviouslyDownloadedData: Yup.boolean().default(false),
  includePaymentsData: Yup.boolean().default(false),
  includeInvoicesData: Yup.boolean().default(false),
  includePurchaseInvoicesData: Yup.boolean().default(false),
});

interface Option {
  label: string;
  value: string;
  icon: JSX.Element;
}

export const Reports = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;

  const formik = useFormik<ReportsForm>({
    validateOnMount: true,
    initialValues: {
      reportType: ReportType.FINANCIALS,
      formatType: FormatType.XERO,
      startDate: null,
      endDate: null,
      includeInvoicesData: false,
      includePaymentsData: false,
      includePurchaseInvoicesData: false,
      includePreviouslyDownloadedData: false,
      includePDFDocuments: false,
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
    full: formik.values.includePreviouslyDownloadedData,
    includeInvoices: formik.values.includeInvoicesData,
    includePayments: formik.values.includePaymentsData,
    includePurchaseInvoices: formik.values.includePurchaseInvoicesData,
  });
  const getInvoicesXero = useInvoicesXero(serviceCompanyId, reportParams);
  const getInvoicesXLSX = useInvoicesXLSX(serviceCompanyId, {
    ...reportParams,
    full: true,
  });
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

      const filesToDownload = pdfUrlsArray.map(([pdfPath, url]) => ({
        invoiceId: pdfPath.split('/').pop()!.replace('.pdf', ''), // Extract the ID from the path (before .pdf)
        url,
      }));

      if (filesToDownload.length) {
        await downloadAndZipFiles(filesToDownload, 'invoice_pdfs');
        setPdfPaths([]);
      }
    };

    if (formik.values.includePDFDocuments && pdfPaths.length) {
      downloadFiles();
    }
  }, [pdfPaths]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const {formatType, reportType, includePDFDocuments} = formik.values;

    if (reportType === ReportType.WORK_HOURS) {
      if (formatType === FormatType.CSV)
        return getEmployeeWorkingHoursCSV.refetch();
      if (formatType === FormatType.EXCEL)
        return getEmployeeWorkingHoursXLSX.refetch();
    } else if (reportType === ReportType.FINANCIALS) {
      if (formatType === FormatType.DATEV) getInvoicesDatev.refetch();
      if (formatType === FormatType.XERO) getInvoicesXero.refetch();
      if (formatType === FormatType.EXCEL) getInvoicesXLSX.refetch();
      if (formatType === FormatType.SAGE50) getInvoicesSage50.refetch();
      if (formatType === FormatType.DF2) getInvoicesDf2.refetch();
      if (includePDFDocuments) {
        if (formatType === FormatType.EXCEL) {
          await getInvoicesXLSX.refetch();
        } else if (formatType === FormatType.DATEV) {
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

  useEffect(() => {
    if (formik.values.reportType === ReportType.FINANCIALS) {
      formik.setFieldValue('formatType', FormatType.XERO);
    } else {
      formik.setFieldValue('formatType', FormatType.EXCEL);
      formik.setFieldValue('includePaymentsData', false);
      formik.setFieldValue('includeInvoicesData', false);
      formik.setFieldValue('includePurchaseInvoicesData', false);
      formik.setFieldValue('includePDFDocuments', false);
      formik.setFieldValue('includePreviouslyDownloadedData', false);
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
                <Typography
                  variant="subtitle2"
                  color={theme.palette.text.secondary}>
                  {t('Report types')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                  }}>
                  {reportTypes.map(renderReportType)}
                </Box>
              </Box>

              {formik.values.reportType === ReportType.FINANCIALS && (
                <FinantialsReportForm formik={formik} />
              )}

              {formik.values.reportType !== ReportType.FINANCIALS && (
                <GenericReportForm formik={formik} />
              )}

              <IncludesSection
                disabled={formik.values.reportType !== ReportType.FINANCIALS}
                formik={formik}
              />
            </Box>
          </Grid>

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
