import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReplayIcon from '@mui/icons-material/Replay';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {PDFContainer} from 'components/PDFContainer';
import {FormLabel} from 'components/form/FormLabel';
import {EmptySection} from 'components/EmptySection';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
import {PdfGenerationStatus} from 'models/misc';
import {formatNetAmount} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {
  useInvoicePaymentStatus,
  usePublishInvoice,
} from 'hooks/reactQuery/useInvoice';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {Confirm} from 'components/Confirm';

interface Props {
  downloadUrl: string;
  invoice: InvoiceView;
}

export const ViewInvoice = ({downloadUrl, invoice}: Props) => {
  const {t} = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {mutate: publishInvoice} = usePublishInvoice();
  const {mutate: markAsPaid} = useInvoicePaymentStatus();

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="1em">
        <Box ml="auto">
          <StatusChip
            label={getInvoiceStatusStyles(invoice.status).label}
            color={getInvoiceStatusStyles(invoice.status).color}
            size="small"
            variant="filled"
          />
        </Box>
        {downloadUrl && (
          <Button
            label="Download Invoice"
            buttonProps={{
              variant: 'outlined',
              onClick: () => window.open(`${downloadUrl}`, '_blank'),
              disabled:
                invoice!.additionalInfo.pdfGenerationStatus !==
                PdfGenerationStatus.DONE,
              startIcon: <FileDownloadIcon color="primary" />,
            }}
          />
        )}
      </Box>
      <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
        <Grid item xs={8}>
          <PageCard
            containerStyles={{mb: '1.5em'}}
            contentContainerStyles={{display: 'flex', gap: '1.5em'}}>
            <Box>
              <FormLabel text="Invoice Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">{invoice.number}</Typography>
            </Box>

            <Box>
              <FormLabel
                text="Total (excl. VAT)"
                sx={{color: 'text.main', textTransform: 'initial'}}
              />
              <Typography variant="subtitle1">
                {formatNetAmount(invoice.totalAmount)}
              </Typography>
            </Box>
          </PageCard>
          {invoice!.additionalInfo.pdfGenerationStatus ===
            PdfGenerationStatus.DONE && downloadUrl.length ? (
            <PDFContainer url={downloadUrl} />
          ) : (
            <PageCard>
              <EmptySection
                label="The PDF generation is in progress, please try again after sometime. We apologize for the inconvenience."
                size="small"
              />
            </PageCard>
          )}
        </Grid>
        <Grid item xs sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <PageCard
            headerLabel="Service Order"
            contentContainerStyles={{
              display: 'flex',
              gap: '1em',
              flexDirection: 'column',
            }}>
            <Box>
              <Box sx={{float: 'right'}}>
                <StatusChip
                  color={getServiceOrderStatusColor(
                    invoice.serviceOrder.status,
                  )}
                  label={serviceOrderStatusToString(
                    invoice.serviceOrder.status,
                  )}
                  size="small"
                />
              </Box>
              <FormLabel text="Order Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">
                {invoice.serviceOrder.number}
              </Typography>
              <Typography variant="caption" sx={{color: 'text.secondary'}}>
                {`${t('Created on')} ${formatDate(
                  invoice.serviceOrder.meta.createdAt,
                )}`}
              </Typography>
              <Box display="flex" alignItems="center" gap=".5em" mt="1em">
                <ServiceOrderIcons
                  serviceOrderType={invoice.serviceOrder.type}
                  size="small"
                />
                <ServiceOrderTypeText
                  serviceOrderType={invoice.serviceOrder.type}
                  capitalizeText
                />
              </Box>
              <Typography variant="caption">
                {invoice.serviceOrder.description}
              </Typography>
            </Box>
          </PageCard>
        </Grid>
      </Grid>

      <Confirm
        open={isDialogOpen}
        onConfirm={() => {
          if (invoice.id) markAsPaid(invoice.id);
          setIsDialogOpen(false);
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as paid"
        content="Do you want to mark this invoice as paid?"
        helperText="This action is irreversible."
      />

      <BottomDrawer
        isOpen={invoice.status !== InvoiceStatus.PAID}
        primaryButtonLabel={
          invoice.status === InvoiceStatus.PAID ? 'Download' : `Mark Paid`
        }
        primaryButtonAction={() => {
          if (
            invoice.status === InvoiceStatus.PAID &&
            invoice.id &&
            downloadUrl
          ) {
            window.open(`${downloadUrl}`, '_blank');
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={
          invoice.status !== InvoiceStatus.PAID
            ? [
                {
                  label: t('Resend'),
                  icon: <ReplayIcon />,
                  onClick: () => {
                    if (invoice.id) publishInvoice(invoice.id);
                  },
                },
              ]
            : []
        }
        isValid={!!downloadUrl.length}
      />
    </Box>
  );
};
