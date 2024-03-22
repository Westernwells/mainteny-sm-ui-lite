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
import {FormikProps} from 'formik';
import {
  ContractServiceForm,
  calculateContractInvoicePriceTotal,
  calculateContractInvoiceRowPrice,
  getSingleItemViewFrequency,
} from 'models/contract';
import {useTranslation} from 'react-i18next';
import {getArticleTypeText} from 'utils/article-utils';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';

type Props = {
  formikContractServiceComponent: FormikProps<ContractServiceForm>;
};

const ServiceInformationReview = ({formikContractServiceComponent}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();

  const columns: {
    name: string;
    align?: TableCellProps['align'];
    width?: TableCellProps['width'];
  }[] = [
    {name: 'Serial Number', align: 'left', width: '15%'},
    {name: 'Building', width: '12%'},
    {name: 'Unit Address', width: '25%'},
    {name: 'Job Frequency', align: 'left', width: '15%'},
    {name: 'Invoice frequency', align: 'left', width: '15%'},
    {name: 'Invoice Price (Excl. VAT)', align: 'right', width: '18%'},
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
          {formikContractServiceComponent.values.name}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={2.5} sx={{display: 'flex', alignItems: 'center'}}>
          <CalendarTodayIcon fontSize="1.6rem" />
          <Box sx={{paddingLeft: '1em'}}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              {t('First job creation')}
            </Typography>
            <Typography variant="h6" color={theme.palette.text.primary}>
              {formikContractServiceComponent.values.firstOrderDate !== null
                ? formatDate(
                    formikContractServiceComponent.values.firstOrderDate,
                  )
                : '-'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2.5} sx={{display: 'flex', alignItems: 'center'}}>
          <CalendarTodayIcon fontSize="1.6rem" />
          <Box sx={{paddingLeft: '1em'}}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              {t('First invoice')}
            </Typography>
            <Typography variant="h6" color={theme.palette.text.primary}>
              {formikContractServiceComponent.values.firstInvoiceDate !== null
                ? formatDate(
                    formikContractServiceComponent.values.firstInvoiceDate,
                  )
                : '-'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2.5} sx={{display: 'flex', alignItems: 'center'}}>
          <ServicePackageIcon fontSize="1.6rem" />
          <Box sx={{paddingLeft: '1em'}}>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              {t('Type')}
            </Typography>
            <Typography variant="h6" color={theme.palette.text.primary}>
              {getArticleTypeText(
                formikContractServiceComponent.values.costType,
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
          {formikContractServiceComponent.values.elevators
            .filter((elevator) => elevator.isSelected)
            ?.map((item, index) => (
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
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
                    {item.externalId || ''}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '12%',
                    display: 'inline-block',
                    borderBottom: 'none',
                    padding: '0.5em 1em 0.5em 0em',
                  }}>
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
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
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
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
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
                    {getSingleItemViewFrequency(item, 'orderGenerationJob')}
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
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
                    {getSingleItemViewFrequency(item, 'invoiceJob')}
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
                  <Typography
                    color={theme.palette.text.primary}
                    variant="body2">
                    {formatCurrency(
                      (calculateContractInvoiceRowPrice(item) || 0) /
                        10 ** (currentCurrency.fractionDigits ?? 0),
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
                Total service price (excl. VAT)
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
                    formikContractServiceComponent.values.elevators,
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
