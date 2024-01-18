import {useEffect, useMemo, useState} from 'react';
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
import SendIcon from '@mui/icons-material/Send';
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
import {
  InvoiceActivityView,
  InvoiceStatus,
  InvoiceType,
  InvoiceTypeMap,
  InvoiceView,
} from 'models/invoice';
import {getInvoiceStatusStyles} from 'pages/Invoices/InvoicesDataGridProps';
import {PdfGenerationStatus} from 'models/misc';
import {formatGrossAmount} from 'utils/currency';
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
import PathImage from 'assets/images/Path.svg';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {ConfirmPrintInvoice} from 'components/ConfirmPrintInvoice';
import {useFormatDate} from 'hooks/useFormatDate';
import {useSnackbar} from 'notistack';
import {isBefore, parseISO, startOfDay} from 'date-fns';
import CustomSnackbar from 'components/CustomSnackbar';
import {Notes} from 'components/Notes';
import {LinearProgress, linearProgressClasses} from '@mui/material';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import {useServiceOrderCheckList} from 'hooks/reactQuery/useServiceOrder';
import {CheckListComponentType} from 'models/checklist';
import {ChecklistStatus} from 'models/service-order';
import {InvoiceActivities} from './InvoiceActivities';

interface Props {
  downloadUrl: string;
  invoice: InvoiceView;
  invoiceActivities: InvoiceActivityView[];
  isLoadingDownloadUrl: boolean;
}

export const ViewInvoice = ({
  downloadUrl,
  invoice,
  invoiceActivities,
  isLoadingDownloadUrl,
}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const theme = useTheme();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmPrintDialogOpen, setIsConfirmPrintDialogOpen] =
    useState(false);
  const {mutate: markAsPaid} = useInvoicePaymentStatus();
  const {mutateAsync: deleteInvoice} = useDeleteInvoice();
  const {mutateAsync: publishInvoice} = usePublishInvoice({
    shouldNavigate: false,
  });

  const isInvoicePDFGenerated =
    invoice.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    downloadUrl;
  const serviceOrder = invoice?.serviceOrder;
  const isWorkReportPDFGenerated = invoice?.additionalInfo?.includeWorkReport
    ? serviceOrder?.report?.additionalInfo?.pdfGenerationStatus ===
      PdfGenerationStatus.DONE
    : true;
  const isPDFsGenerated = !!isWorkReportPDFGenerated && isInvoicePDFGenerated;

  const {data: serviceOrderCheckList} = useServiceOrderCheckList(
    serviceOrder?.additionalInfo.checkListInfo?.checkListId && serviceOrder.id,
  );

  const checklistSummary = useMemo(() => {
    const componentsWithoutHead =
      serviceOrderCheckList?.components.filter(
        (c) => c.type !== CheckListComponentType.HEAD,
      ) ?? [];
    const doneList = componentsWithoutHead.filter((item) => {
      if (item.type === CheckListComponentType.TEXT) {
        return !!item.additionalInfo.note;
      }

      if (item.additionalInfo.moreInfoInNote && !!item.additionalInfo.note) {
        return true;
      }

      return (item.additionalInfo.answer?.length || 0) > 0;
    });

    return {all: componentsWithoutHead.length, done: doneList.length};
  }, [serviceOrderCheckList?.components]);

  const percentComplete = Math.round(
    checklistSummary.all === 0
      ? 0
      : (checklistSummary.done! / checklistSummary.all!) * 100,
  );

  const actions = useMemo(() => {
    const items = [];
    if (
      isInvoicePDFGenerated &&
      (invoice.status === InvoiceStatus.DRAFT ||
        invoice.status === InvoiceStatus.EXPIRED)
    ) {
      items.unshift(
        {
          label: t('Send Overdue Notice'),
          icon: <SendIcon />,
          onClick: () => navigate(`/invoices/${invoice.id}/overdue-notice`),
        },
        {
          label: t('Print'),
          icon: <Print />,
          onClick: () => setIsConfirmPrintDialogOpen(true),
        },
      );
    } else if (invoice.status === InvoiceStatus.NOT_PAID) {
      items.unshift({
        label: t('Resend'),
        icon: <ReplayIcon />,
        onClick: () => {
          setIsSendEmailDialogOpen(true);
        },
      });
    }
    items.push({
      label: t('Edit'),
      icon: <Edit />,
      onClick: () => {
        navigate(`/invoices/details/${invoice.id}/edit`);
      },
    });
    if (
      ![InvoiceStatus.NOT_PAID, InvoiceStatus.EXPIRED].includes(invoice.status)
    ) {
      items.push({
        label: t('Delete'),
        icon: <DeleteIcon />,
        onClick: () => {
          setIsDeleteDialogOpen(true);
        },
      });
    } else if (invoice.sentDate || invoice.status === InvoiceStatus.CANCELLED) {
      return items.filter((item) => item.label !== t('Edit'));
    }
    return items;
  }, [downloadUrl, invoice.status]);

  const onPrintInvoice = async () => {
    await publishInvoice(
      {
        id: invoice.id,
        body: {
          email: '',
          subject: '',
          content: '',
        },
      },
      {
        onSuccess: () => {
          setIsConfirmPrintDialogOpen(false);
          setTimeout(() => {
            if (downloadUrl) {
              printJS({
                printable: downloadUrl,
                type: 'pdf',
                showModal: true,
              });
            }
          }, 8000);
        },
      },
    );
  };

  useEffect(() => {
    let snackbarId: string | number;

    if (
      invoice?.additionalInfo.pdfGenerationStatus ===
      PdfGenerationStatus.RUNNING
    ) {
      snackbarId = enqueueSnackbar(
        <Box display="flex" padding="0em" margin="0em" alignItems="center">
          <img alt={t('Path Image')} src={PathImage} />{' '}
          <Typography margin="0em" paddingLeft="0.5em" variant="body2">
            {t('PDF generation is in progress. Please wait...')}
          </Typography>
        </Box>,
        {
          variant: 'info',
          autoHideDuration: null,
        },
      );
    }

    return () => {
      if (snackbarId) {
        closeSnackbar(snackbarId);
      }
    };
  }, [invoice?.additionalInfo.pdfGenerationStatus]);

  const isDueDateInPast = () => {
    if (invoice?.status !== InvoiceStatus.DRAFT) {
      return false;
    }

    const localDueDate = invoice.dueDate as string;
    const dueDateObject = startOfDay(
      parseISO(new Date(localDueDate).toISOString()),
    );
    const todayObject = startOfDay(new Date());

    return isBefore(dueDateObject, todayObject);
  };

  const validateDueDate = () => {
    if (!invoice.dueDate) {
      return t(`The due date is missing for this invoice`);
    }

    if (isDueDateInPast()) {
      return t(`The due date for the invoice has expired`);
    }
  };

  const onInvoiceSend = () => {
    const errorMessage = validateDueDate();

    if (errorMessage) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });

      return;
    }

    setIsSendEmailDialogOpen(true);
  };

  const generateEmailSubject = () => {
    const name =
      invoice?.type === InvoiceType.CREDIT_NOTE
        ? invoice.serviceCompany?.name
        : invoice.propertyOwner?.name;
    const type =
      invoice?.type === InvoiceType.CREDIT_NOTE ? 'Credit Note' : 'Invoice';

    return t(`${name} - ${t(type)} {{invoiceNumber}}`, {
      invoiceNumber: invoice?.number ?? '',
    });
  };

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
              <Notes
                parentId={invoice.propertyOwner.id}
                title="Customer Notes"
                type="customer"
              />
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
                    startIcon: <FileDownloadIcon />,
                  }}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <PageCard
            containerStyles={{mb: '1.5em'}}
            contentContainerStyles={{display: 'flex', gap: '4em'}}>
            <Box>
              <FormLabel text="Invoice Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1" fontWeight="600">
                {invoice.externalId || t('Unassigned')}
              </Typography>
            </Box>

            <Box>
              <FormLabel text="Invoice Type" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1" fontWeight="600">
                {t(InvoiceTypeMap[invoice.type]).toUpperCase()}
              </Typography>
            </Box>

            <Box>
              <FormLabel
                text="Total"
                sx={{color: 'text.main', textTransform: 'initial'}}
              />
              <Typography variant="subtitle1" fontWeight="600">
                {formatGrossAmount(invoice.totalAmount)}
              </Typography>
            </Box>
          </PageCard>

          {invoice!.additionalInfo.pdfGenerationStatus ===
            PdfGenerationStatus.DONE && !isLoadingDownloadUrl ? (
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
          {/* SERVICE ORDER CARD */}

          {!!serviceOrder && (
            <PageCard
              headerLabel="Service Job"
              headerIcon={
                <ManageSearchOutlinedIcon sx={{color: '#8F9BB380'}} />
              }
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
                navigate(`/orders/details/${serviceOrder?.id}`)
              }>
              <Box>
                <Box sx={{float: 'right'}}>
                  {serviceOrder && (
                    <StatusChip
                      color={getServiceOrderStatusColor(serviceOrder.status)}
                      label={serviceOrderStatusToString(serviceOrder.status)}
                      size="small"
                    />
                  )}
                </Box>
                <FormLabel text="Job Number" sx={{color: 'text.main'}} />
                <Typography
                  variant="caption"
                  component="div"
                  color={theme.palette.primary.mainLight}
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: '400',
                    p: '0.2em 0em 0.5em 0em',
                  }}>
                  {serviceOrder?.number}
                </Typography>
                {serviceOrder && (
                  <Typography
                    variant="caption"
                    sx={{color: 'text.secondary', fontSize: '0.6rem'}}
                    display="block"
                    mt="-0.25rem">
                    {t('Created on {{creationDate}}', {
                      creationDate: formatDate(serviceOrder.meta.createdAt),
                    })}
                  </Typography>
                )}
                <Box display="flex" alignItems="center" gap=".2em" mt="1em">
                  <ServiceOrderIcons
                    serviceOrderType={serviceOrder?.type}
                    size="small"
                  />
                  <ServiceOrderTypeText
                    serviceOrderType={serviceOrder?.type}
                    capitalizeText
                  />
                </Box>
                <Typography variant="caption">
                  {serviceOrder?.description}
                </Typography>
              </Box>
            </PageCard>
          )}

          {/* WORK REPORT CARD */}
          {serviceOrder?.report && (
            <PageCard
              headerLabel={t('Work Report')}
              headerIcon={<GradingOutlinedIcon sx={{color: '#8F9BB380'}} />}
              headerStyles={{
                pt: '11px',
                mx: 0,
                px: '1rem',
              }}
              headerActionIcon={
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              }
              handleAction={() =>
                navigate(`/orders/details/${serviceOrder?.id}?tab=1`)
              }>
              <Typography variant="body1">
                {!!serviceOrder.actualStartTime &&
                  `${formatDate(serviceOrder.actualStartTime)} :`}
                {serviceOrder.report?.description ?? '-'}
              </Typography>
            </PageCard>
          )}

          {/* CHECKLIST CARD */}
          {serviceOrder?.additionalInfo.checkListInfo?.status ===
            ChecklistStatus.COMPLETED && (
            <PageCard
              headerLabel={t('Checklist')}
              headerIcon={<FactCheckOutlinedIcon sx={{color: '#8F9BB380'}} />}
              headerStyles={{
                pt: '11px',
                mx: 0,
                px: '1rem',
              }}
              headerActionIcon={
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              }
              handleAction={() =>
                navigate(`/orders/details/${serviceOrder?.id}?tab=2`)
              }>
              <Typography variant="body1" sx={{m: '0em 0em 0.8em 0em'}}>
                {serviceOrderCheckList?.name}
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" sx={{fontWeight: '600'}}>
                  {checklistSummary.done}/{checklistSummary.all} {t('options')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {percentComplete}% {t('complete')}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentComplete}
                sx={{
                  backgroundColor: `${theme.palette.text.secondary}`,
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: '#4CAF50',
                  },
                }}
              />
            </PageCard>
          )}

          {/* INVOICE ACTIVITY CARD */}

          {invoiceActivities?.length ? (
            <InvoiceActivities activities={invoiceActivities} />
          ) : null}
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
            onInvoiceSend();
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
        confirmBtnDisabled={!isPDFsGenerated}
        email={
          invoice.propertyOwner?.additionalInfo.billingEmail ||
          invoice.propertyOwner?.contact.email
        }
        subject={generateEmailSubject()}
        content={invoice.description}
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
            deleteInvoice(
              {invoiceId: invoice.id, shouldNavigate: true},
              {
                onSuccess: () => {
                  enqueueSnackbar(
                    <CustomSnackbar
                      message="Invoice deleted"
                      snackIcon="delete"
                    />,
                    {
                      variant: 'info',
                      anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
                    },
                  );
                },
              },
            );
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Invoice"
        content="Do you want to delete this Invoice?"
        helperText="This action is irreversible."
      />
      <ConfirmPrintInvoice
        open={isConfirmPrintDialogOpen}
        onConfirm={onPrintInvoice}
        onClose={() => setIsConfirmPrintDialogOpen(false)}
      />
    </Box>
  );
};
