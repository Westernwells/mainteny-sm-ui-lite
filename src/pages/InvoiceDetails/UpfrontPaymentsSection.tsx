import {Fragment, useEffect} from 'react';
import {t} from 'i18next';
import {theme} from 'theme';
import {Grid, Typography, Box, InputAdornment, Divider} from '@mui/material';
import {FormikProps} from 'formik';
import {NumberFormatValues} from 'react-number-format';
import {FormInput} from 'components/form/FormInput';
import {InvoiceFormData, InvoiceView, PaymentType} from 'models/invoice';
import {
  aggregatedAmountToMoney,
  formatCurrency,
  useCurrentCurrency,
} from 'utils/currency';
import {
  calculateTotalAmountInclVats,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {fixRounding} from 'utils/utils';
import {ReactComponent as UpfrontInvoiceIcon} from 'assets/icons/UpfrontInvoiceIcon.svg';
import {getAggregatedPartialPaymentsVats} from './utils';
import {SectionTitle} from './SectionTitle';

interface Props {
  formik: FormikProps<InvoiceFormData>;
  invoice?: InvoiceView;
}

export const UpfrontPaymentsSection = ({formik, invoice}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const subtotalExclVat = calculateTotalWithPerItemDiscount(formik.values);

  const handlePartialPaymentChange = (values: {
    name?: string;
    value?: number;
  }) => {
    const {value} = values;
    if (formik.values.payment?.type === PaymentType.LUMP_SUM) {
      formik.setFieldValue('payment', {
        ...formik.values.payment,
        amount: {
          value: value || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    } else if (formik.values.payment?.type === PaymentType.PERCENTAGE) {
      formik.setFieldValue('payment', {
        ...formik.values.payment,
        percentage: value || 0,
      });
    }
  };

  const isAllowedAmountField = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (!floatValue) {
      return true;
    }

    if (
      floatValue < 0 ||
      formik.values.payment?.type === PaymentType.PERCENTAGE
    ) {
      return false;
    }

    return floatValue <= subtotalExclVat;
  };

  const isAllowedPercentageField = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (!floatValue) {
      return true;
    }

    if (floatValue < 0) {
      return false;
    }

    const maxPercentage = 100;

    return floatValue <= maxPercentage;
  };

  const amount =
    formik.values.payment?.type === PaymentType.LUMP_SUM
      ? formik.values.payment?.amount?.value ?? 0
      : formik.values.payment?.type === PaymentType.PERCENTAGE
      ? (subtotalExclVat * (formik.values.payment?.percentage ?? 0)) / 100
      : 0;

  const totalAmountExclVat = amount;
  const totalAmountExclVatFormatted = formatCurrency(
    fixRounding(totalAmountExclVat, 2),
    {
      currency: currentCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
    },
  );

  const allItemsHasSameVAT = formik.values.items.every(
    (item) =>
      item.unitAmount.percentageVat ===
      formik.values.items[0].unitAmount.percentageVat,
  );

  const percentageVats = formik.values.items.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: formik.values.items[0].unitAmount.percentageVat,
            vat:
              totalAmountExclVat *
              (formik.values.items[0].unitAmount.percentageVat / 100),
          },
        ]
      : getAggregatedPartialPaymentsVats(
          formik.values.items,
          totalAmountExclVat,
        )
    : [];

  const totalAmountInclVats = calculateTotalAmountInclVats({
    subtotalExclVatAfterDiscount: totalAmountExclVat,
    percentageVats,
  });

  const totalAmountInclVatsFormatted = formatCurrency(
    fixRounding(totalAmountInclVats, 2),
    {
      currency: currentCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'floor',
    },
  );

  useEffect(() => {
    // initialize payment object if it's not set
    if (!formik.values.payment) {
      if (invoice?.additionalInfo.payment) {
        const amountMoney = aggregatedAmountToMoney(
          invoice.additionalInfo.payment.amount,
        );
        amountMoney.value =
          (amountMoney?.value ?? 0) / 10 ** (amountMoney?.fractionDigits ?? 2);
        formik.setFieldValue('payment', {
          ...invoice.additionalInfo.payment,
          amount: amountMoney,
        });
      } else {
        formik.setFieldValue('payment', {
          type: PaymentType.LUMP_SUM,
          amount: {
            value: 0,
            currency: currentCurrency.code,
            fractionDigits: currentCurrency.fractionDigits,
          },
        });
      }
    }
  }, [invoice]);

  return (
    <Grid item xs={12} bgcolor="white" p={3}>
      <Box pb={2}>
        <SectionTitle Icon={UpfrontInvoiceIcon} title="Upfront Payments" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        rowGap={2.5}
        border="1px solid"
        borderColor="action.focus"
        borderRadius={1}
        p={2}>
        <Grid container rowGap={2.5} justifyContent="space-between">
          <Grid item xs={7}>
            <FormInput
              props={{
                size: 'small',
                label: 'Name',
                name: 'payment.description',
                value: formik.values.payment?.description,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
          <Grid item xs={4} display="flex" justifyContent="flex-end" gap={2}>
            {formik.values.payment?.type === PaymentType.PERCENTAGE && (
              <FormInput
                inputType="currency"
                onValueChange={handlePartialPaymentChange}
                props={{
                  value: formik.values.payment?.percentage,
                  label: 'Percentage',
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                    inputProps: {
                      style: {textAlign: 'right'},
                    },
                  },
                }}
                numericFormatProps={{
                  allowLeadingZeros: false,
                  decimalScale: 0,
                  isAllowed: isAllowedPercentageField,
                }}
              />
            )}
            <FormInput
              inputType="currency"
              {...(formik.values.payment?.type === PaymentType.LUMP_SUM
                ? {
                    onValueChange: handlePartialPaymentChange,
                  }
                : {})}
              props={{
                value: amount,
                label: 'Amount (excl. VAT)',
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {currentCurrency.symbol}
                    </InputAdornment>
                  ),
                  inputProps: {
                    style: {textAlign: 'right'},
                  },
                },
              }}
              numericFormatProps={{
                disabled:
                  formik.values.payment?.type === PaymentType.PERCENTAGE,
                isAllowed: isAllowedAmountField,
                allowLeadingZeros: false,
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{borderColor: theme.palette.grey[300]}} />

        <Box
          pl="20%"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            justifyItems: 'end',
            alignItems: 'center',
            gap: 2,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Total amount (excl. VAT)')}
          </Typography>

          <Typography variant="subtitle2" color="primary.dark">
            {totalAmountExclVatFormatted}
          </Typography>

          {allItemsHasSameVAT ? (
            <>
              <Typography variant="body1" color="primary.dark">
                {t('VAT')} {percentageVats?.[0]?.percentageVat ?? 0}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formatCurrency(fixRounding(percentageVats?.[0]?.vat ?? 0, 2), {
                  currency: currentCurrency.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
                })}
              </Typography>
            </>
          ) : (
            percentageVats.map((v) => (
              <Fragment key={v.percentageVat}>
                <Typography variant="body1" color="primary.dark">
                  {t('VAT')} {v.percentageVat}%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatCurrency(fixRounding(v.vat, 2), {
                    currency: currentCurrency.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    roundingMode: 'floor',
                  })}
                </Typography>
              </Fragment>
            ))
          )}
          <Typography variant="subtitle1" color="primary.dark" fontWeight={600}>
            {t('Total amount (incl. VAT)')}
          </Typography>
          <Typography variant="subtitle1" color="primary.dark" fontWeight={600}>
            {totalAmountInclVatsFormatted}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
};
