import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
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
import {formatGrossAmount, useCurrentCurrency} from 'utils/currency';
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
import CustomSnackbar from 'components/CustomSnackbar';
import {LinearProgress, linearProgressClasses} from '@mui/material';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import {useQueryServiceOrderChecklists} from 'hooks/reactQuery/useChecklists';
import {CheckListComponentType} from 'models/checklist';
import {ChecklistStatus} from 'models/service-order';
import {validateDueDate, getInvoicePDFStatuses} from 'utils/invoice-utils';
import {useDownloadFileWithCustomName} from 'hooks/reactQuery/useDownloadUrl';
import {pdf} from '@react-pdf/renderer';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import useLogoDimensions from 'hooks/useLogoDimensions';
import useLogoImage from 'hooks/useLogoImage';
import {companyLanguageContextMap} from 'utils/utils';
import CreditNotePdfTemplate from 'components/pdf-templates/CreditNotePdfTemplate';
import PdfPreview from 'pages/OrderArticle/PDFPreview';
import FullInvoicePdfTemplate from 'components/pdf-templates/FullInvoicePdfTemplate';
import {Notes} from './Notes/EditNotes';
import {InvoiceActivities} from './InvoiceActivities';

interface Props {
  downloadUrl: string;
  invoice: InvoiceView;
  invoiceActivities: InvoiceActivityView[];
  isLoadingDownloadUrl: boolean;
}

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const ViewInvoice = ({
  downloadUrl,
  invoice,
  invoiceActivities,
  isLoadingDownloadUrl,
}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const theme = useTheme();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const [filePathToDownload, setFilePathToDownload] = useState('');
  const imageUrl = useLogoImage(user);
  const logoDimensions = useLogoDimensions(imageUrl);

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string) => {
      if (company?.language) {
        return translateCompanyLanguage(key);
      }

      return t(key);
    },
    [company?.language],
  );

  const {downloadFile} = useDownloadFileWithCustomName(
    invoice.number,
    downloadUrl,
  );

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

  const {isInvoicePDFGenerated, isPDFsGenerated} =
    getInvoicePDFStatuses(invoice);
  const serviceOrder = invoice?.serviceOrder;

  const {data: serviceOrderCheckLists} = useQueryServiceOrderChecklists({
    serviceOrderId: serviceOrder?.id || '',
    options: {
      enabled: !!serviceOrder?.id,
    },
  });

  const completedChecklists = serviceOrderCheckLists?.filter(
    (c) => c.additionalInfo.status === ChecklistStatus.COMPLETED,
  );

  const checklistSummaries = useMemo(() => {
    const data = completedChecklists?.map((checklist) => {
      const componentsWithoutHead =
        checklist?.checkList.components.filter(
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

      return {
        name: checklist?.checkList.name,
        all: componentsWithoutHead.length,
        done: doneList.length,
        percentComplete:
          componentsWithoutHead.length === 0
            ? 0
            : Math.round(
                (doneList.length / componentsWithoutHead.length) * 100,
              ),
      };
    });
    return data;
  }, [serviceOrderCheckLists]);

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

  const generateBlobUrl = async () => {
    let PdfTemplate;

    if (
      invoice.type === InvoiceType.FULL ||
      invoice.type === InvoiceType.AGGREGATE
    ) {
      PdfTemplate = FullInvoicePdfTemplate;
    } else {
      PdfTemplate = CreditNotePdfTemplate;
    }

    if (
      invoice.type === InvoiceType.CREDIT_NOTE ||
      invoice.type === InvoiceType.FULL ||
      invoice.type === InvoiceType.AGGREGATE
    ) {
      // TODO: will remove when all invoice types PDFs are ready
      const blob = await pdf(
        <PdfTemplate
          userInfo={user?.userAccount}
          currentCurrency={currentCurrency}
          logoSrc={imageUrl}
          logoDimensions={logoDimensions}
          invoice={invoice}
          selectedLng={company?.language}
          translate={translate}
        />,
      ).toBlob();
      const blobURL = URL.createObjectURL(blob);
      setFilePathToDownload(blobURL);
    }
  };

  useEffect(() => {
    generateBlobUrl();
  }, [invoice, logoDimensions]);

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
          if (filePathToDownload) {
            printJS({
              printable: filePathToDownload || downloadUrl,
              type: 'pdf',
              showModal: true,
            });
          }
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

  const onInvoiceSend = () => {
    const errorMessage = validateDueDate(invoice);

    if (errorMessage) {
      enqueueSnackbar(t(errorMessage), {
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
                    onClick: downloadFile,
                    disabled:
                      invoice!.additionalInfo.pdfGenerationStatus !==
                        PdfGenerationStatus.DONE || isLoadingDownloadUrl,
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
                {invoice.externalId || t('Automatically assigned')}
              </Typography>
            </Box>

            <Box>
              <FormLabel text="Invoice Type" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1" fontWeight="600">
                {t(`${InvoiceTypeMap[invoice.type]} invoice`)}
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

          {(invoice.type === InvoiceType.CREDIT_NOTE ||
            invoice.type === InvoiceType.FULL ||
            invoice.type === InvoiceType.AGGREGATE) && (
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
              <PdfPreview blobUrl={filePathToDownload} />
            </Box>
          )}

          {invoice.type !== InvoiceType.CREDIT_NOTE &&
            invoice.type !== InvoiceType.FULL &&
            invoice.type !== InvoiceType.AGGREGATE && (
              <Box>
                {invoice &&
                invoice.additionalInfo &&
                invoice.additionalInfo.pdfGenerationStatus ===
                  PdfGenerationStatus.DONE &&
                !isLoadingDownloadUrl ? (
                  <PDFContainer url={downloadUrl} />
                ) : (
                  <PageCard>
                    <EmptySection
                      label="The PDF generation is in progress, please try again after sometime. We apologize for the inconvenience."
                      size="small"
                    />
                  </PageCard>
                )}
              </Box>
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
                    sx={{color: 'text.secondary', fontSize: '0.7rem'}}
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
                mx: 0,
                mt: 0,
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
              {serviceOrder.actualStartTime &&
              serviceOrder.report?.description ? (
                <Typography variant="body1">
                  {formatDate(serviceOrder.actualStartTime)}:
                  {serviceOrder.report.description}
                </Typography>
              ) : null}
            </PageCard>
          )}

          {/* CHECKLIST CARD */}
          {(completedChecklists?.length ?? 0) > 0 && (
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
              }
              contentContainerStyles={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}>
              {checklistSummaries?.map((c, idx) => (
                <Box key={`${c.name}-${idx}`}>
                  <Typography variant="body1" sx={{m: '0em 0em 0.8em 0em'}}>
                    {c.name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" sx={{fontWeight: '600'}}>
                      {c.done}/{c.all} {t('options')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.percentComplete}% {t('complete')}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={c.percentComplete}
                    sx={{
                      backgroundColor: `${theme.palette.text.secondary}`,
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: '#4CAF50',
                      },
                    }}
                  />
                </Box>
              ))}
            </PageCard>
          )}

          {/* INVOICE ACTIVITY CARD */}

          {invoiceActivities?.length ? (
            <InvoiceActivities
              activities={invoiceActivities}
              invoice={invoice}
            />
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
        confirmBtnDisabled={!isPDFsGenerated}
        email={
          invoice.propertyOwner?.additionalInfo.billingEmail ||
          invoice.propertyOwner?.contact.email
        }
        subject={generateEmailSubject()}
        content={invoice.description}
        callback={async (emailRecord) => {
          setIsSendEmailDialogOpen(false);

          publishInvoice({
            id: invoice!.id,
            body: {
              email: emailRecord.email,
              subject: emailRecord.subject,
              content: emailRecord.content,
              emails: [emailRecord.email],
            },
          });
        }}
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
