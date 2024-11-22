import React from 'react';
import {Box, Grid, Link, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {Link as RouterLink} from 'react-router-dom';
import {PurchaseInvoiceView} from 'models/purchaseInvoice';
import {SectionTitle} from 'pages/InvoiceDetails/SectionTitle';
import {StatusChip} from 'components/StatusChip';
import {useTranslation} from 'react-i18next';
import DOMPurify from 'dompurify';
import {formatCurrency, centsToMoney} from 'utils/currency';
import {DiscountType} from 'models/invoice';
import {formatDate} from 'utils/datetime';
import {
  getPurchaseInvoiceStatusColor,
  purchaseInvoiceStatusToString,
} from 'utils/purchaseInvoice';
import {ReactComponent as PinIllustration} from 'assets/illustrations/invoice/pin.svg';

interface PurchaseInvoiceInfoProps {
  purchaseInvoice?: PurchaseInvoiceView;
}

const getCommonLinkStyles = () => ({
  paddingTop: '0.2em',
  display: 'block',
  fontWeight: '600',
  maxWidth: '300px',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textWrap: 'wrap',
  fontSize: '0.95rem',
  color: '#0092B2',
});

export const PurchaseInvoiceInfo = ({
  purchaseInvoice,
}: PurchaseInvoiceInfoProps) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Grid
      container
      item
      xs={4}
      xl={4}
      rowGap={4}
      bgcolor="white"
      p={3}
      borderRadius={1}>
      <Grid container item xs={12} rowGap={2.5}>
        <Box pb={0.5}>
          <SectionTitle Icon={PinIllustration} title="General Info" />
        </Box>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Supplier')}
              </Typography>
              <Link
                component={RouterLink}
                to={`/articles/supplier/${purchaseInvoice?.additionalInfo.supplier.id}`}
                underline="hover"
                variant="body2"
                sx={getCommonLinkStyles()}
                color={theme.palette.info.main}>
                {purchaseInvoice?.additionalInfo.supplier.name || '-'}
              </Link>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Supplier ID')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {purchaseInvoice?.additionalInfo.supplier.externalId || '-'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Job number')}
              </Typography>
              {purchaseInvoice?.additionalInfo.serviceOrders.map(
                (serviceOrder, index) => (
                  <Link
                    component={RouterLink}
                    key={`${serviceOrder.serviceOrder.id}-${index}`}
                    to={`/orders/details/${serviceOrder.serviceOrder.id}`}
                    underline="hover"
                    variant="body2"
                    sx={getCommonLinkStyles()}
                    color={theme.palette.info.main}>
                    {serviceOrder.serviceOrder.externalId || '-'}
                  </Link>
                ),
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Net Amount')}
              </Typography>
              {purchaseInvoice?.additionalInfo.serviceOrders.map(
                (serviceOrder, index) => (
                  <Typography
                    variant="body1"
                    key={`${serviceOrder.serviceOrder.id}-${index}`}
                    color={theme.palette.primary.dark}>
                    {formatCurrency(
                      centsToMoney(
                        purchaseInvoice?.totalAmount.currency!,
                        serviceOrder.netAmount!,
                      ),
                    )}
                  </Typography>
                ),
              )}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Invoice date')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {formatDate(purchaseInvoice?.sentDate) || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Due date')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {formatDate(purchaseInvoice?.dueDate) || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Invoice Number')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {purchaseInvoice?.externalId || '-'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            {t('Subject')}
          </Typography>
          <Typography variant="body1" color={theme.palette.primary.dark}>
            {purchaseInvoice?.subject || '-'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            {t('Description')}
          </Typography>
          <Typography
            color={theme.palette.primary.dark}
            variant="body1"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(purchaseInvoice?.description!),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Currency')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {purchaseInvoice?.totalAmount.currency || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Net Amount')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {formatCurrency(
                  centsToMoney(
                    purchaseInvoice?.totalAmount.currency!,
                    purchaseInvoice?.totalAmount.netAmount ?? 0,
                  ),
                )}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Tax rate')}
              </Typography>
              {purchaseInvoice?.totalAmount.vats.map((vat) => (
                <Typography
                  variant="body1"
                  color={theme.palette.primary.dark}
                  key={vat.percentageVat}>
                  {vat.percentageVat}%
                </Typography>
              ))}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Tax amount')}
              </Typography>
              {purchaseInvoice?.totalAmount.vats.map((vat) => (
                <Typography
                  variant="body1"
                  color={theme.palette.primary.dark}
                  key={vat.vat}>
                  {formatCurrency(
                    centsToMoney(
                      purchaseInvoice?.totalAmount.currency,
                      vat.vat ?? 0,
                    ),
                  )}
                </Typography>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Discount')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {purchaseInvoice?.additionalInfo.discount.type ===
                DiscountType.PERCENTAGE
                  ? `${purchaseInvoice?.additionalInfo.discount.percentage}%`
                  : formatCurrency(
                      purchaseInvoice?.additionalInfo.discount.amount.value ??
                        0,
                    )}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('Gross amount')}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {formatCurrency(
                  centsToMoney(
                    purchaseInvoice?.totalAmount.currency!,
                    purchaseInvoice?.totalAmount.grossAmount ?? 0,
                  ),
                )}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary" pb={1}>
            {t('Status')}
          </Typography>
          <StatusChip
            color={getPurchaseInvoiceStatusColor(purchaseInvoice?.status!)}
            label={purchaseInvoiceStatusToString(purchaseInvoice?.status!)}
            variant="filled"
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
