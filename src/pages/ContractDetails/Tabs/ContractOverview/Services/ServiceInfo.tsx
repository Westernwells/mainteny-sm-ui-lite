import {
  Box,
  Divider,
  Grid,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {ReactComponent as ServicePackageIcon} from 'assets/icons/ServicePackageIcon.svg';
import {ReactComponent as CalendarTodayIcon} from 'assets/icons/CalendarToday.svg';
import {ReactComponent as UnionIcon} from 'assets/icons/UnionIcon.svg';
import {formatDate} from 'utils/datetime';
import {theme} from 'theme';
import {
  ContractComponentView,
  ContractElevatorView,
  ContractServiceFormElevator,
  calculateContractInvoicePriceTotal,
} from 'models/contract';
import {
  calculateContractInvoiceRowPrice,
  getElevatorDataByElevator,
} from 'utils/contract-utils';
import {useTranslation} from 'react-i18next';
import {getArticleTypeText} from 'utils/article-utils';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {getViewFrequency} from 'utils/elevator-utils';
import {ArticleType} from 'models/article';
import {ElevatorView} from 'models/elevator';

type Props = {
  service?: ContractComponentView;
  elevators: ContractElevatorView[] | ElevatorView[];
};

const ServiceInformationReview = ({service, elevators}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();

  const elevatorsData = getElevatorDataByElevator(
    elevators,
    service as ContractComponentView,
  );

  const columns: {
    name: string;
    align?: TableCellProps['align'];
    width?: TableCellProps['width'];
  }[] = [
    {name: 'Serial Number', align: 'left', width: '15%'},
    {name: 'Building', width: '12%'},
    {name: 'Unit Address', width: '25%'},
    {name: 'Job frequency', align: 'left', width: '15%'},
    {name: 'Invoice frequency', align: 'left', width: '15%'},
    {name: 'Invoice Price (EXCL. VAT)', align: 'right', width: '18%'},
  ];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '0em 0em 2em 0em',
        }}>
        <UnionIcon fontSize="2rem" />
        <Typography
          variant="h5"
          color={theme.palette.text.primary}
          sx={{paddingLeft: '0.5em'}}>
          {service?.name}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={2.5} sx={{display: 'flex', alignItems: 'center'}}>
          <CalendarTodayIcon fontSize="1.6rem" />
          <Box sx={{paddingLeft: '1em'}}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              First job creation
            </Typography>
            <Typography variant="h6" color={theme.palette.text.primary}>
              {service?.additionalInfo?.firstOrderDate !== null
                ? formatDate(service?.additionalInfo?.firstOrderDate)
                : '-'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2.5} sx={{display: 'flex', alignItems: 'center'}}>
          <CalendarTodayIcon fontSize="1.6rem" />
          <Box sx={{paddingLeft: '1em'}}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              First invoice
            </Typography>
            <Typography variant="h6" color={theme.palette.text.primary}>
              {service?.additionalInfo?.firstInvoiceDate !== null
                ? formatDate(service?.additionalInfo?.firstInvoiceDate)
                : '-'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2.5} sx={{display: 'flex', alignItems: 'center'}}>
          <ServicePackageIcon fontSize="1.6rem" />
          <Box sx={{paddingLeft: '1em'}}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Type
            </Typography>
            <Typography variant="h6" color={theme.palette.text.primary}>
              {getArticleTypeText(
                service?.additionalInfo?.costType as ArticleType,
              ) || '-'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <TableContainer sx={{marginTop: '1em'}}>
        <TableHead sx={{display: 'block', borderBottom: '1px solid #8F9BB380'}}>
          <TableRow sx={{display: 'block'}}>
            {columns.map((column) => (
              <TableCell
                key={column.name}
                align={column.align || 'left'}
                sx={{display: 'inline-block', padding: '1em 0em'}}
                width={column.width}>
                <Typography
                  variant="subtitle2"
                  color={theme.palette.text.secondary}>
                  {t(column.name).toUpperCase()}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{display: 'block'}}>
          {elevatorsData?.map((item, index) => (
            <TableRow
              sx={{
                width: '100%',
                display: 'block',
                cursor: 'pointer',
                '&:hover': {
                  background: '#F2F6F8',
                },
              }}
              key={index}>
              <TableCell
                sx={{
                  width: '15%',
                  display: 'inline-block',
                  padding: '0.5em',
                  borderBottom: 'none',
                }}>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {item.externalId || 'Unassigned'}
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: '12%',
                  display: 'inline-block',
                  borderBottom: 'none',
                  padding: '0.5em 1em 0.5em 0em',
                }}>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {item.buildingLocation || '-'}
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: '25%',
                  display: 'inline-block',
                  borderBottom: 'none',
                  padding: '0.5em 1em 0.5em 0em',
                }}>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {item.address || '-'}
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: '15%',
                  display: 'inline-block',
                  textAlign: 'left',
                  borderBottom: 'none',
                  padding: '0em 1em 0em 0em',
                }}>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {getViewFrequency(item?.orderGenerationJob) || '-'}
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: '15%',
                  display: 'inline-block',
                  textAlign: 'left',
                  borderBottom: 'none',
                  padding: '0em 1em 0em 0em',
                }}>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {getViewFrequency(item?.invoiceJob) || '-'}
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: '18%',
                  display: 'inline-block',
                  textAlign: 'right',
                  borderBottom: 'none',
                  padding: '1em 0em 1em 1em',
                }}>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {formatCurrency(
                    calculateContractInvoiceRowPrice(item) /
                      10 ** (currentCurrency.fractionDigits ?? 0) ?? 0,
                    {
                      currency: currentCurrency.code,
                    },
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          ))}

          <Divider
            sx={{width: '100%', borderColor: '#8F9BB380', padding: '0.2em'}}
          />
          <TableRow
            sx={{
              width: '100%',
              display: 'block',
              padding: '0.5em 0em',
            }}>
            <TableCell sx={{width: '65%', display: 'inline-block'}} />

            <TableCell
              sx={{
                display: 'inline-block',
                borderBottom: 'none',
                width: '25%',
                textAlign: 'left',
              }}>
              <Typography variant="h6">
                {t('Total service price (excl. VAT)')}
              </Typography>
            </TableCell>

            <TableCell
              sx={{
                display: 'inline-block',
                textAlign: 'right',
                borderBottom: 'none',
                padding: '0em',
                width: '10%',
              }}>
              <Typography variant="h6">
                {' '}
                {formatCurrency(
                  calculateContractInvoicePriceTotal(
                    service?.additionalInfo
                      ?.elevators as ContractServiceFormElevator[],
                  ) /
                    10 ** (currentCurrency.fractionDigits ?? 0) ?? 0,
                  {
                    currency: currentCurrency.code,
                  },
                )}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    </>
  );
};

export default ServiceInformationReview;
