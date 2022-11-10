import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {Dialog} from 'components/Dialog';
import {FormLabel} from 'components/form/FormLabel';
import {PDFContainer} from 'components/PDFContainer';
import {BottomDrawer} from 'components/BottomDrawer';
import {EmptySection} from 'components/EmptySection';
import {Confirm} from 'components/Confirm';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {useReplyQuotation} from 'hooks/reactQuery/useQuotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {PdfGenerationStatus} from 'models/misc';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {formatCurrency} from 'utils/currency';
import {useTranslation} from 'react-i18next';
import {CreateServiceOrder} from './CreateServiceOrder';
import {ServiceOrderDetails} from './ServiceOrderDetails';
import {Notes} from './Notes';

interface Props {
  downloadUrl: string;
  quotation: QuotationView;
}

export const ViewQuotation = ({downloadUrl, quotation}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const {mutate: markAsAccepted} = useReplyQuotation();

  const formik = useFormik({
    initialValues: {
      createServiceOrder: '',
    },
    onSubmit: (values) => {
      if (values.createServiceOrder && quotation)
        navigate(
          `/orders/new?type=${values.createServiceOrder.toLowerCase()}&quotationId=${
            quotation.id
          }`,
        );
    },
  });

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
          {quotation!.additionalInfo.pdfGenerationStatus ===
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
                  {t(
                    'No service order has been created for this quotation yet!',
                  )}
                </Typography>
                <Button
                  label="Create Service Order"
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
        </Grid>
      </Grid>
      <BottomDrawer
        isOpen={quotation.status !== QuotationStatus.ACCEPTED}
        primaryButtonLabel="Mark Accepted"
        primaryButtonAction={() => {
          setIsDialogOpen(true);
        }}
        listItems={[]}
        isValid
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
      <Dialog
        title="Create Service Order"
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
