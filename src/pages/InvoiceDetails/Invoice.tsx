import {useState} from 'react';
import {useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import DraftsIcon from '@mui/icons-material/Drafts';
import ReplayIcon from '@mui/icons-material/Replay';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {PDFContainer} from 'components/PDFContainer';
import {FormLabel} from 'components/form/FormLabel';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
import {PdfGenerationStatus} from 'models/misc';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {useInvoicePaymentStatus} from 'hooks/reactQuery/useInvoice';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {Confirm} from 'components/Confirm';

interface Props {
  downloadUrl: string;
  invoice: InvoiceView;
}

export const Invoice = ({downloadUrl, invoice}: Props) => {
  const navigate = useNavigate();
  const [isDrawerOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
              onClick: () =>
                window.open(`${Object.values(downloadUrl)[0]}`, '_blank'),

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
              <FormLabel text="Quotation Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">{invoice.number}</Typography>
            </Box>

            <Box>
              <FormLabel text="Total" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">
                {formatCurrency(
                  invoice.totalAmount.grossAmount /
                    10 ** invoice.totalAmount.fractionDigits!,
                  {currency: invoice.totalAmount.currency},
                )}
              </Typography>
            </Box>
          </PageCard>
          {invoice!.additionalInfo.pdfGenerationStatus ===
            PdfGenerationStatus.DONE && downloadUrl.length ? (
            <PDFContainer url={downloadUrl} />
          ) : null}
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
                {`Created on ${formatDate(
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

          <PageCard
            headerLabel="Work Report"
            contentContainerStyles={{
              display: 'flex',
              gap: '1em',
              flexDirection: 'column',
            }}>
            <Box>
              <Typography>
                10.06.2020: Secured lift and counterweight for disconnection of
                engine and brake. Disassembled engine with brake and delivered
                it to a workshop in Råde.
              </Typography>
              <Typography mt="1em">
                22.06.2020: Picked up engine at workshop. Mounted motor with
                brake and removed securing of lift and counterweight. Refilled
                oil on the gear unit between the hoist and the shaft for
                chains....
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
        isOpen={isDrawerOpen}
        primaryButtonLabel={
          invoice.status === InvoiceStatus.PAID ? 'Duplicate' : 'Mark as paid'
        }
        primaryButtonAction={() => {
          if (invoice.status === InvoiceStatus.PAID && invoice.id) {
            navigate(`/invoices/new?id=${invoice.id}`);
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={
          invoice.status !== InvoiceStatus.PAID
            ? [
                {
                  label: 'Resend',
                  icon: <ReplayIcon />,
                  onClick: () => {},
                },
                {
                  label: 'Duplicate',
                  icon: <CopyAllIcon />,
                  onClick: () => {
                    navigate(`/invoices/new?id=${invoice.id}`);
                  },
                },
              ]
            : []
        }
        isValid
      />
    </Box>
  );
};
