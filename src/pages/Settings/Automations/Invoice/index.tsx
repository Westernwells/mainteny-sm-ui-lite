import {Typography, Grid, Box, Tooltip} from '@mui/material';
import {InfoCard} from 'components/InfoCard';
import {t} from 'i18next';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {ReactComponent as AccountingInvoiceMail} from 'assets/icons/InvoiceIcon.svg';
import {useFormik} from 'formik';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyItem} from 'models/service-company';
import {Switch} from 'components/Switch';
import {SxProps} from '@mui/system';
import InvoiceArticles from './InvoiceArticles';

type Props = {
  company: ServiceCompanyItem;
  containerStyles?: SxProps;
};

const Invoice = ({company, containerStyles}: Props) => {
  const {mutateAsync: updateCompany} = useUpdateCompany(
    'Invoice Automation Settings Updated',
  );

  const formik = useFormik({
    initialValues: {
      contractInvoiceGenerationEnabled:
        (company.settings.contractInvoiceGenerationEnabled ||
          company.settings.isContractInvoiceGenerationEnabled) ??
        false,
      invoiceQRCodeEnabled: company.settings.invoiceQRCodeEnabled ?? false,
    },
    onSubmit: () => {},
  });

  const handleSave = async (options: any) => {
    await updateCompany({
      body: options,
      companyId: company?.id || '',
    });
  };

  return (
    <InfoCard
      header={<Typography variant="h5">{t('Invoice')}</Typography>}
      showHeaderBackground={false}
      containerStyles={{
        height: 'fit-content',
        ...containerStyles,
      }}
      headerIcon={<AccountingInvoiceMail width="1.5rem" height="1.5rem" />}>
      <Grid container direction="column" gap={2}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: '0 0 80%',
              display: 'flex',
              alignItems: 'center',
            }}>
            {t('Automatically create invoices from contracts')}:
            <Tooltip
              title={t(
                'You can turn on & off the automatic invoice creation for the entire company. If turned on, the invoices will be created automatically based on the settings for each contract.',
              )}
              placement="top"
              arrow>
              <Box sx={{ml: 0.5, mb: -0.7}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Box>
            </Tooltip>
          </Typography>

          <Switch
            value={formik.values.contractInvoiceGenerationEnabled}
            onChanged={async (value) => {
              await handleSave({contractInvoiceGenerationEnabled: value});
              formik.setFieldValue('contractInvoiceGenerationEnabled', value);
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: '0 0 80%',
              display: 'flex',
              alignItems: 'center',
            }}>
            {t('Add a swiss QR page to the invoice')}:
            <Tooltip
              title={t(
                'A new page will be appended to your invoice, there you’ll find the QR code.',
              )}
              placement="top"
              arrow>
              <Box sx={{ml: 0.5, mb: -0.7}}>
                <AlertInfoIcon width="16px" height="16px" />
              </Box>
            </Tooltip>
          </Typography>

          <Switch
            value={formik.values.invoiceQRCodeEnabled}
            onChanged={async (value) => {
              await handleSave({invoiceQRCodeEnabled: value});
              formik.setFieldValue('invoiceQRCodeEnabled', value);
            }}
          />
        </Box>

        <Grid>
          <InvoiceArticles />
        </Grid>
      </Grid>
    </InfoCard>
  );
};

export default Invoice;
