import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import printJS from 'print-js';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReplayIcon from '@mui/icons-material/Replay';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Print from '@mui/icons-material/Print';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {BottomDrawer} from 'components/BottomDrawer';
import {PDFContainer} from 'components/PDFContainer';
import {FormLabel} from 'components/form/FormLabel';
import {EmptySection} from 'components/EmptySection';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {ServiceOrderReport} from 'models/service-order';
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
import {PdfGenerationStatus} from 'models/misc';
import {formatNetAmount} from 'utils/currency';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {MarkAsPaidDialog} from 'components/MarkAsPaidDialog';
import {
  useDeleteInvoice,
  useInvoicePaymentStatus,
  usePublishInvoice,
} from 'hooks/reactQuery/useInvoice';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {useFormatDate} from 'hooks/useFormatDate';
import {Notes} from './Notes';

interface Props {
  downloadUrl: string;
  invoice: InvoiceView;
  workReport: ServiceOrderReport;
}

export const ViewInvoice = ({downloadUrl, invoice, workReport}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {mutate: markAsPaid} = useInvoicePaymentStatus();
  const {mutate: deleteInvoice} = useDeleteInvoice();

  const isPDFGenerated =
    invoice.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    downloadUrl;

  const actions = useMemo(() => {
    const items = [];
    if (
      isPDFGenerated &&
      (invoice.status === InvoiceStatus.DRAFT ||
        invoice.status === InvoiceStatus.EXPIRED)
    ) {
      items.unshift({
        label: t('Print'),
        icon: <Print />,
        onClick: () =>
          downloadUrl &&
          printJS({
            printable: downloadUrl,
            type: 'pdf',
            showModal: true,
          }),
      });
    } else if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.unshift({
        label: t('Resend'),
        icon: <ReplayIcon />,
        onClick: () => {
          setIsSendEmailDialogOpen(true);
        },
      });
    }
    items.push(
      ...[
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => {
            navigate(`/invoices/details/${invoice.id}/edit`);
          },
        },
        {
          label: t('Delete'),
          icon: <DeleteIcon />,
          onClick: () => {
            setIsDeleteDialogOpen(true);
          },
        },
      ],
    );
    return items;
  }, [downloadUrl]);

  return (
    <Box>
      <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
        <Grid item xs={12}>
          <Grid container flexDirection="row">
            <Grid item xs={4}>
              <StatusChip
                label={getInvoiceStatusStyles(invoice.status).label}
                color={getInvoiceStatusStyles(invoice.status).color}
                size="small"
                variant="filled"
              />
            </Grid>

            <Grid
              item
              xs={4}
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              gap={0.5}>
              <Notes invoice={invoice!} />
            </Grid>

            <Grid item xs={4} textAlign="end">
              {downloadUrl && (
                <Button
                  label="Download Invoice"
                  buttonProps={{
                    variant: 'outlined',
                    size: 'medium',
                    sx: {
                      background: 'transparent',
                    },
                    onClick: () => window.open(`${downloadUrl}`, '_blank'),
                    disabled:
                      invoice!.additionalInfo.pdfGenerationStatus !==
                      PdfGenerationStatus.DONE,
                    startIcon: <FileDownloadIcon color="primary" />,
                  }}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
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
                text="Total"
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
              mx: 0,
              pt: '0.5rem',
            }}
            headerActionIcon={
              <OpenInNewIcon
                fontSize="small"
                sx={{color: theme.palette.secondary.dark}}
              />
            }
            headerStyles={{
              mx: 0,
              px: '1rem',
            }}
            handleAction={() =>
              navigate(`/orders/details/${invoice.serviceOrder?.id}`)
            }>
            <Box>
              <Box sx={{float: 'right'}}>
                {invoice.serviceOrder && (
                  <StatusChip
                    color={getServiceOrderStatusColor(
                      invoice.serviceOrder.status,
                    )}
                    label={serviceOrderStatusToString(
                      invoice.serviceOrder.status,
                    )}
                    size="small"
                  />
                )}
              </Box>
              <FormLabel text="Order Number" sx={{color: 'text.main'}} />
              <Typography variant="caption" component="div">
                {invoice.serviceOrder?.number}
              </Typography>
              {invoice.serviceOrder && (
                <Typography
                  variant="caption"
                  sx={{color: 'text.secondary'}}
                  display="block"
                  mt="-0.25rem">
                  {`${t('Created on')} ${formatDate(
                    invoice.serviceOrder.meta.createdAt,
                  )}`}
                </Typography>
              )}
              <Box display="flex" alignItems="center" gap=".2em" mt="1em">
                <ServiceOrderIcons
                  serviceOrderType={invoice.serviceOrder?.type}
                  size="small"
                />
                <ServiceOrderTypeText
                  serviceOrderType={invoice.serviceOrder?.type}
                  capitalizeText
                />
              </Box>
              <Typography variant="caption">
                {invoice.serviceOrder?.description}
              </Typography>
            </Box>
          </PageCard>
          {!!workReport && (
            <PageCard
              headerLabel={t('Work Report')}
              headerStyles={{
                pt: '11px',
              }}>
              <Typography variant="body1">
                {formatDate(workReport.serviceOrder.actualStartTime)}:{' '}
                {workReport.description || '-'}
              </Typography>
            </PageCard>
          )}
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
          invoice.status === InvoiceStatus.DRAFT ||
          invoice.status === InvoiceStatus.EXPIRED
            ? 'Send'
            : 'Payment'
        }
        primaryButtonAction={() => {
          if (
            invoice.status === InvoiceStatus.DRAFT ||
            invoice.status === InvoiceStatus.EXPIRED
          ) {
            setIsSendEmailDialogOpen(true);
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={!!downloadUrl.length}
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={invoice.id}
        submitHook={usePublishInvoice}
        confirmBtnDisabled={!isPDFGenerated}
      />

      <MarkAsPaidDialog
        invoice={invoice}
        open={isDialogOpen}
        onConfirm={() => setIsDialogOpen(false)}
        onClose={() => setIsDialogOpen(false)}
      />

      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (invoice.id)
            deleteInvoice({invoiceId: invoice.id, shouldNavigate: false});
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="Do you want to delete this Invoice?"
        helperText="This action is irreversible."
      />
    </Box>
  );
};
