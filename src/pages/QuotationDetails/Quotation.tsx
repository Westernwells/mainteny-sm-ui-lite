import {useState} from 'react';
import {useNavigate} from 'react-router';
import {useFormik} from 'formik';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {Button} from 'components/Button';
import {StatusChip} from 'components/StatusChip';
import {PageCard} from 'components/PageCard';
import {Dialog} from 'components/Dialog';
import {QuotationView} from 'models/quotation';
import {getQuotationStatusStyles} from 'pages/Quotations/QuotationsDataGridProps';
import {PdfGenerationStatus} from 'models/misc';
import {formatCurrency} from 'utils/currency';
import {BottomDrawer} from './Components/BottomDrawer';
import {PDFContainer} from './Components/PDFContainer';
import {Label} from './Components/Label';
import {CreateServiceOrder} from './CreateServiceOrder';
import {ServiceOrderDetails} from './ServiceOrderDetails';

interface Props {
  downloadUrl: string;
  quotation: QuotationView;
}

export const Quotation = ({downloadUrl, quotation}: Props) => {
  const navigate = useNavigate();
  const [isDrawerOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="1em">
        <Box ml="auto">
          <StatusChip
            label={getQuotationStatusStyles(quotation.status).label}
            color={getQuotationStatusStyles(quotation.status).color}
            size="small"
            variant="filled"
          />
        </Box>
        {downloadUrl && (
          <Button
            label="Download Quotation"
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
              <Label text="Quotation Number" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">{quotation.number}</Typography>
            </Box>

            <Box>
              <Label text="Total" sx={{color: 'text.main'}} />
              <Typography variant="subtitle1">
                {formatCurrency(
                  quotation.totalAmount.grossAmount /
                    10 ** quotation.totalAmount.fractionDigits!,
                  {currency: quotation.totalAmount.currency},
                )}
              </Typography>
            </Box>
          </PageCard>
          {quotation!.additionalInfo.pdfGenerationStatus ===
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
              alignItems: 'center',
              flexDirection: 'column',
            }}>
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
                  You haven’t created Service Order for this Quotation
                </Typography>
                <Button
                  label="Create Service Order"
                  buttonProps={{
                    variant: 'outlined',
                    size: 'small',
                    onClick: () => setIsDialogOpen(true),
                  }}
                />
              </>
            )}
          </PageCard>
        </Grid>
      </Grid>
      <BottomDrawer
        isOpen={isDrawerOpen}
        primaryButtonLabel="Duplicate"
        primaryButtonAction={() => {
          if (quotation.id) navigate(`/quotations/new?id=${quotation.id}`);
        }}
        listItems={[]}
        isValid
      />
      <Dialog
        title="Create Service Order"
        onCancel={() => setIsDialogOpen(false)}
        disableSaveBtn={!formik.values.createServiceOrder}
        onSave={() => formik.handleSubmit()}
        dialogProps={{
          maxWidth: 'xs',
          open: isDialogOpen || false,
        }}>
        <CreateServiceOrder
          value={formik.values.createServiceOrder}
          onChange={formik.handleChange}
        />
      </Dialog>
    </Box>
  );
};
