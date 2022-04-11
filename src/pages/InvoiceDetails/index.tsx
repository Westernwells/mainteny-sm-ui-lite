import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {StatusChip} from 'components/StatusChip';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import {CardProps} from 'components/CardProps';
import {useParams} from 'react-router-dom';
import {BackAction} from 'components/BackAction';
import {CustomButtonUnstyled} from 'components/CustomButtonUnstyled';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {HistoryCard} from 'pages/UnitDetails/Tabs/ServiceHistoryTab/HistoryCard';
import {formatDate, getDateObject} from 'utils/datetime';
import {InvoiceStatus, InvoiceStatusView} from 'models/invoice';
import {formatCurrency} from 'utils/currency';
import {Progress} from 'components/Progress';
import {PdfGenerationStatus} from 'models/misc';
import {InvoiceCard} from './InvoiceCard';
import {Invoice} from './Invoice';
import {RelatedTo} from './RelatedTo';

export const InvoiceDetails = () => {
  const {id: invoiceId} = useParams();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);

  const {data: downloadUrl} = useDownloadUrl(
    isFetched ? [invoice!.additionalInfo.pdfPath] : [],
  );
  const theme = useTheme();

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb="0.5em">
        <BackAction label="Invoice Details" />
        <CustomButtonUnstyled
          label="Download Invoice"
          disabled={!downloadUrl}
          size="small"
          onClick={() =>
            downloadUrl ? window.open(downloadUrl[0], '_blank') : null
          }
          startIcon={
            <FileDownloadIcon
              sx={{opacity: !downloadUrl ? '0.1' : '1'}}
              color="primary"
            />
          }
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <InvoiceCard
            header={
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{invoice!.number}</Typography>
                  <Typography
                    variant="body2"
                    sx={{color: theme.palette.text.secondary}}>
                    Generated on{' '}
                    {formatDate(
                      getDateObject(invoice!.meta.createdAt),
                      'dd MMM YYY',
                    )}
                  </Typography>
                </Box>

                <Box display="flex">
                  <CardProps
                    label="Total Cost"
                    bodyTextVariant="subtitle1"
                    icon={
                      <MonetizationOnOutlinedIcon
                        color={
                          invoice!.status === InvoiceStatus.PAID
                            ? 'success'
                            : 'warning'
                        }
                        sx={{width: '1.25rem', height: '1.25rem'}}
                      />
                    }
                    containerStyles={{mr: '0.5em'}}
                    iconBackground={theme.palette.success.outlinedHoverBg}
                    iconMaxHeight="3rem"
                    bodyText={`
                      ${formatCurrency(
                        invoice
                          ? invoice!.totalAmount.amount /
                              10 ** invoice!.totalAmount.fractionDigits!
                          : 0,
                        {
                          currency: invoice
                            ? invoice!.totalAmount.currency
                            : 'EUR',
                        },
                      )}`}
                  />
                  <StatusChip
                    label={
                      invoice!.status === InvoiceStatus.PAID
                        ? InvoiceStatusView.PAID
                        : InvoiceStatusView.NOT_PAID
                    }
                    textColor={
                      invoice!.status === InvoiceStatus.PAID
                        ? theme.palette.success.main
                        : theme.palette.warning.main
                    }
                    bgColor={
                      invoice!.status === InvoiceStatus.PAID
                        ? theme.palette.success.outlinedHoverBg
                        : theme.palette.warning.outlinedHoverBg
                    }
                  />
                </Box>
              </Box>
            }>
            {invoice!.additionalInfo.pdfGenerationStatus ===
            PdfGenerationStatus.DONE ? (
              <Invoice downloadUrl={downloadUrl ? downloadUrl[0] : null} />
            ) : null}
          </InvoiceCard>
        </Grid>

        <Grid item xs={4}>
          <InvoiceCard
            header={<Typography variant="subtitle1">Related To</Typography>}
            headerContainerStyle={{pb: '0.5em'}}>
            <RelatedTo>
              <HistoryCard
                serviceOrder={invoice!.serviceOrder}
                headerTitle={formatDate(
                  invoice!.serviceOrder.schedules[0].startTime,
                  'dd MMM YYY',
                )}
                subtitle={`${formatDate(
                  invoice!.serviceOrder.schedules[0].startTime,
                  'ha',
                )} - ${formatDate(
                  invoice!.serviceOrder.schedules[0].endTime,
                  'ha',
                )}`}
                description={invoice!.serviceOrder.description}
                containerStyles={{borderRadius: 0}}
                showPointer
                removeShadows
                bodyContainerStyle={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              />
            </RelatedTo>
          </InvoiceCard>

          <InvoiceCard
            containerStyles={{mt: '1em'}}
            header={<Typography variant="subtitle1">Work Report</Typography>}
            headerContainerStyle={{pb: '0.5em'}}>
            <RelatedTo>
              <Typography>
                10 / 6-2020: Secured lift and counterweight for disconnection of
                engine and brake. Disassembled engine with brake and delivered
                it to a workshop in Råde. 22 / 6-2020: Picked up engine at
                workshop. Mounted motor with brake and removed securing of lift
                and counterweight. Refilled oil on the gear unit between the
                hoist and the shaft for chains. Controlled brake, ok. Controlled
                stop length in the event of a breakdown of photocells. Average
                stop length: 7.5 cm. Max stop length: 16.5 cm. Elevator put into
                operation
              </Typography>
            </RelatedTo>
          </InvoiceCard>
        </Grid>
      </Grid>
    </Box>
  );
};
