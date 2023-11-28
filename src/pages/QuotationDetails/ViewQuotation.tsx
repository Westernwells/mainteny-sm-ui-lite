import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import printJS from 'print-js';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReplayIcon from '@mui/icons-material/Replay';
import Print from '@mui/icons-material/Print';
import Edit from '@mui/icons-material/Edit';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {Dialog} from 'components/Dialog';
import {FormLabel} from 'components/form/FormLabel';
import {PDFContainer} from 'components/PDFContainer';
import {BottomDrawer} from 'components/BottomDrawer';
import {EmptySection} from 'components/EmptySection';
import {Confirm} from 'components/Confirm';
import {SendEmailDialog} from 'components/SendEmailDialog';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {
  usePublishQuotation,
  useReplyQuotation,
} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {PdfGenerationStatus} from 'models/misc';
import {
  QuotationActivityView,
  QuotationStatus,
  QuotationView,
} from 'models/quotation';
import {formatCurrency} from 'utils/currency';
import {useTranslation} from 'react-i18next';
import {useSnackbar} from 'notistack';
import PathImage from 'assets/images/Path.svg';
import {convertToMacro} from 'utils/utils';
import {CreateServiceOrder} from './CreateServiceOrder';
import {ServiceOrderDetails} from './ServiceOrderDetails';
import {Notes} from './Notes';
import {QuotationActivities} from './QuotationActivities';

interface Props {
  downloadUrl: string;
  quotation: QuotationView;
  quotationActivities: QuotationActivityView[];
  isLoadingDownloadUrl: boolean;
}

export const ViewQuotation = ({
  downloadUrl,
  quotation,
  quotationActivities,
  isLoadingDownloadUrl,
}: Props) => {
  const {t} = useTranslation();
  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const theme = useTheme();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isRejectedDialogOpen, setIsRejectedDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const {mutate: markAsAccepted} = useReplyQuotation();
  const {mutateAsync: publishQuotation} = usePublishQuotation();

  const formik = useFormik({
    initialValues: {
      createServiceOrder: '',
    },
    onSubmit: (values) => {
      if (values.createServiceOrder && quotation)
        navigate(
          `/orders/new?type=${convertToMacro(
            values.createServiceOrder,
          ).toLowerCase()}&quotationId=${quotation.id}`,
        );
    },
  });

  const isPDFGenerated =
    quotation.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE &&
    !isLoadingDownloadUrl;

  const onPrintQuotation = async () => {
    if (quotation.status !== QuotationStatus.DRAFT) {
      if (downloadUrl) {
        printJS({
          printable: downloadUrl,
          type: 'pdf',
          showModal: true,
        });
      }
      return;
    }

    await publishQuotation(
      {
        id: quotation.id,
        body: {
          email: '',
          subject: '',
          content: '',
        },
      },
      {
        onSuccess: () => {
          if (downloadUrl) {
            printJS({
              printable: downloadUrl,
              type: 'pdf',
              showModal: true,
            });
          }
        },
      },
    );
  };

  const actions = useMemo(() => {
    const items = [];

    if (quotation.status === QuotationStatus.DRAFT) {
      items.push({
        label: t('Mark Accepted'),
        icon: <Check />,
        onClick: () => setIsDialogOpen(true),
      });
    } else {
      items.push({
        label: t('Resend'),
        icon: <ReplayIcon />,
        onClick: () => setIsSendEmailDialogOpen(true),
      });
    }

    if (isPDFGenerated) {
      items.push({
        label: t('Print'),
        icon: <Print />,
        onClick: onPrintQuotation,
      });
    }

    items.push(
      ...[
        {
          label: t('Edit'),
          icon: <Edit />,
          onClick: () => navigate(`/quotations/details/${quotation.id}/edit`),
        },
        {
          label: t('Mark Rejected'),
          icon: <Close />,
          onClick: () => setIsRejectedDialogOpen(true),
        },
      ],
    );

    if (quotation.status === QuotationStatus.SENT_TO_CLIENT) {
      return items.filter((item) => item.label !== t('Edit'));
    }
    return items;
  }, [downloadUrl]);

  useEffect(() => {
    if (
      quotation?.additionalInfo.pdfGenerationStatus ===
      PdfGenerationStatus.RUNNING
    ) {
      enqueueSnackbar(
        <Box display="flex" padding="0em" margin="0em" alignItems="center">
          <img alt={t('Path Image')} src={PathImage} />{' '}
          <Typography margin="0em" paddingLeft="0.5em" variant="body2">
            {t('PDF generation is in progress. Please wait...')}
          </Typography>
        </Box>,
        {
          variant: 'info',
          autoHideDuration: 8000,
        },
      );
    }

    if (
      quotation?.additionalInfo.pdfGenerationStatus !==
      PdfGenerationStatus.RUNNING
    ) {
      closeSnackbar();
    }
  }, [quotation]);

  return (
    <Box>
      <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
        <Grid item xs={12}>
          <Grid container flexDirection="row">
            <Grid item xs={4}>
              <StatusChip
                label={getQuotationStatusStyles(quotation.status).label}
                color={getQuotationStatusStyles(quotation.status).color}
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
              <Notes quotation={quotation!} />
            </Grid>

            <Grid item xs={4} textAlign="end">
              {downloadUrl && (
                <Button
                  label="Download Quotation"
                  buttonProps={{
                    variant: 'outlined',
                    size: 'medium',
                    sx: {
                      background: 'transparent',
                    },
                    onClick: () => window.open(`${downloadUrl}`, '_blank'),
                    disabled:
                      quotation!.additionalInfo.pdfGenerationStatus !==
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
            contentContainerStyles={{display: 'flex', gap: '1.5em'}}>
            <Box>
              <FormLabel text="Quotation Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">{quotation.number}</Typography>
            </Box>

            <Box>
              <FormLabel
                text="Total (excl. VAT)"
                sx={{color: 'text.main', textTransform: 'initial'}}
              />
              <Typography variant="subtitle1">
                {formatCurrency(
                  quotation.totalAmount.netAmount /
                    10 ** quotation.totalAmount.fractionDigits!,
                  {currency: quotation.totalAmount.currency},
                )}
              </Typography>
            </Box>
          </PageCard>
          {isPDFGenerated ? (
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
            headerLabel="Service Job"
            contentContainerStyles={{
              display: 'flex',
              gap: '1em',
              alignItems: 'center',
              flexDirection: 'column',
              mx: 0,
              pt: '0.5rem',
            }}
            headerStyles={{
              mx: 0,
              px: '1rem',
            }}
            headerActionIcon={
              quotation.additionalInfo &&
              'serviceOrderIds' in quotation.additionalInfo ? (
                <OpenInNewIcon
                  fontSize="small"
                  sx={{color: theme.palette.secondary.dark}}
                />
              ) : undefined
            }
            handleAction={() =>
              navigate(
                `/orders/details/${
                  quotation?.additionalInfo?.serviceOrderIds?.[0] ?? ''
                }`,
              )
            }>
            {quotation.additionalInfo &&
            'serviceOrderIds' in quotation.additionalInfo ? (
              <ServiceOrderDetails
                serviceOrderId={
                  quotation.additionalInfo.serviceOrderIds[0] as string
                }
              />
            ) : (
              <>
                <Typography variant="subtitle2" textAlign="center">
                  {t('No service job has been created for this quotation yet!')}
                </Typography>
                <Button
                  label="Create Service Job"
                  buttonProps={{
                    variant: 'outlined',
                    size: 'small',
                    sx: {
                      background: 'transparent',
                    },
                    onClick: () => setIsOrderDialogOpen(true),
                  }}
                />
              </>
            )}
          </PageCard>
          {quotationActivities?.length ? (
            <QuotationActivities activities={quotationActivities} />
          ) : null}
        </Grid>
      </Grid>
      <BottomDrawer
        isOpen={
          quotation.status !== QuotationStatus.ACCEPTED &&
          quotation.status !== QuotationStatus.REJECTED
        }
        primaryButtonLabel={
          quotation.status === QuotationStatus.DRAFT ? 'Send' : 'Mark Accepted'
        }
        primaryButtonAction={() => {
          if (quotation.status === QuotationStatus.DRAFT) {
            setIsSendEmailDialogOpen(true);
          } else {
            setIsDialogOpen(true);
          }
        }}
        listItems={actions.map((item, index) => ({
          ...item,
          showBorder: actions.length === index + 2,
        }))}
        isValid
      />
      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onConfirm={() => setIsSendEmailDialogOpen(false)}
        onClose={() => setIsSendEmailDialogOpen(false)}
        id={quotation.id}
        submitHook={usePublishQuotation}
        confirmBtnDisabled={!isPDFGenerated}
        email={
          quotation.elevator.propertyOwner?.additionalInfo.billingEmail ||
          quotation.elevator.propertyOwner?.contact.email
        }
        subject={quotation.subject}
        content={quotation.description}
      />
      <Confirm
        open={isDialogOpen}
        onConfirm={() => {
          if (quotation.id && user)
            markAsAccepted({
              quotationId: quotation.id,
              reply: {
                actorId: user.userAccount.id,
                accepted: true,
                isAccepted: true,
                comments: ' ',
              },
            });
          setIsDialogOpen(false);
        }}
        onClose={() => setIsDialogOpen(false)}
        title="Mark as accepted"
        content="Do you want to mark this quotation as accepted?"
        helperText="This action is irreversible."
      />
      <Confirm
        open={isRejectedDialogOpen}
        onConfirm={() => {
          if (quotation.id && user)
            markAsAccepted({
              quotationId: quotation.id,
              reply: {
                actorId: user.userAccount.id,
                accepted: false,
                isAccepted: false,
                comments: ' ',
              },
            });
          setIsRejectedDialogOpen(false);
        }}
        onClose={() => setIsRejectedDialogOpen(false)}
        title="Mark as rejected"
        content="Do you want to mark this quotation as rejected?"
        helperText="This action is irreversible."
      />
      <Dialog
        title="Create Service Job"
        onCancel={() => setIsOrderDialogOpen(false)}
        disableSaveBtn={!formik.values.createServiceOrder}
        onSave={() => formik.handleSubmit()}
        dialogProps={{
          maxWidth: 'xs',
          open: isOrderDialogOpen || false,
        }}>
        <Box mt=".5em" mb="5em">
          <CreateServiceOrder
            value={formik.values.createServiceOrder}
            onChange={formik.handleChange}
          />
        </Box>
      </Dialog>
    </Box>
  );
};
