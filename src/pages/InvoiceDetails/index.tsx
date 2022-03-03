import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import axios from 'axios';
// import {
//   useInvoiceDetail,
//   useInvoiceDownloadUrl,
// } from 'hooks/reactQuery/useInvoice';
import {StatusChip} from 'components/StatusChip';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import {CardProps} from 'components/CardProps';
import {useParams} from 'react-router-dom';
import {HistoryCard} from 'pages/UnitDetails/Tabs/ServiceHistoryTab/HistoryCard';
import {BackAction} from 'components/BackAction';
import {CustomButtonUnstyled} from 'components/CustomButtonUnstyled';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import Button from '@mui/material/Button';
import {InvoiceCard} from './InvoiceCard';
import {Invoice} from './Invoice';
import {RelatedTo} from './RelatedTo';

export const InvoiceDetails = () => {
  // const {id: invoiceId} = useParams();
  // const {data: invoice} = useInvoiceDetail(invoiceId);
  // const {data: downloadUrl} = useDownloadUrl(
  //   invoice?.additionalInfo.pdfPath ? [invoice?.additionalInfo.pdfPath] : [],
  // );
  // console.log(downloadUrl, '!!!!!!!!!!!');

  // TODO: Fetch Download URL
  const downloadUrl = [`${process.env.REACT_APP_BASE_URL}/INV000128.pdf`];
  const theme = useTheme();

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
                  <Typography variant="subtitle1">#INV000128</Typography>
                  <Typography
                    variant="body2"
                    sx={{color: theme.palette.text.secondary}}
                  >
                    Generated on 24 Sep 2021
                  </Typography>
                </Box>

                <Box display="flex">
                  <CardProps
                    label="Total Cost"
                    bodyTextVariant="subtitle1"
                    icon={
                      <MonetizationOnOutlinedIcon
                        color="success"
                        sx={{width: '1.25rem', height: '1.25rem'}}
                      />
                    }
                    containerStyles={{mr: '0.5em'}}
                    iconBackground={theme.palette.success.outlinedHoverBg}
                    iconMaxHeight="3rem"
                    bodyText="9,700 EUR"
                  />
                  <StatusChip
                    label="Paid"
                    textColor={theme.palette.success.main}
                    bgColor={theme.palette.success.outlinedHoverBg}
                  />
                </Box>
              </Box>
            }
          >
            <Invoice downloadUrl={downloadUrl ? downloadUrl[0] : null} />
          </InvoiceCard>
        </Grid>

        <Grid item xs={4}>
          <InvoiceCard
            header={<Typography variant="subtitle1">Related To</Typography>}
            headerContainerStyle={{pb: '0.5em'}}
          >
            <RelatedTo>
              <HistoryCard removeShadows />
            </RelatedTo>
          </InvoiceCard>

          <InvoiceCard
            containerStyles={{mt: '1em'}}
            header={<Typography variant="subtitle1">Work Report</Typography>}
            headerContainerStyle={{pb: '0.5em'}}
          >
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
