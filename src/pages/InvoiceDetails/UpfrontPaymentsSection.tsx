import {Fragment, useEffect} from 'react';
import {t} from 'i18next';
import {theme} from 'theme';
import {Grid, Typography, Box, InputAdornment, Divider} from '@mui/material';
import {FormikProps, getIn} from 'formik';
import {NumberFormatValues} from 'react-number-format';
import {FormInput} from 'components/form/FormInput';
import {
  InvoiceFormData,
  InvoiceType,
  InvoiceView,
  PaymentType,
} from 'models/invoice';
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
import {T} from 'utils/i18n-utils';

interface Props {
  formik: FormikProps<InvoiceFormData>;
  previousInvoices: InvoiceView[];
  invoice?: InvoiceView;
}

export const UpfrontPaymentsSection = ({
  formik,
  previousInvoices: allPreviousInvoices,
  invoice,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const isEditing = !!invoice;
  // if editing, we need to show only past invoices till this one (editing invoice included)
  // if creating, we need to show all invoices
  const previousInvoices = isEditing
    ? allPreviousInvoices.slice(
        0,
        allPreviousInvoices.findIndex((i) => i.id === invoice.id) + 1,
      )
    : allPreviousInvoices;

  const subtotalExclVat = calculateTotalWithPerItemDiscount(formik.values);

  const handleUpfrontPaymentChange = (values: {
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

  const previousInvoicesTotalExclVat = previousInvoices
    .map(
      (i) =>
        (i.totalAmount?.netAmount ?? 0) /
        10 ** (i.totalAmount?.fractionDigits ?? 2),
    )
    .reduce((a, b) => a + b, 0);

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

    const maxAmount =
      subtotalExclVat -
      previousInvoicesTotalExclVat +
      (isEditing
        ? (invoice.totalAmount?.netAmount ?? 0) /
          10 ** (invoice.totalAmount?.fractionDigits ?? 2)
        : 0);

    return floatValue <= maxAmount;
  };

  const prevInvoicesPercentage = previousInvoices
    .map((i) => i.additionalInfo.payment?.percentage ?? 0)
    .reduce((a, b) => a + b, 0);

  const isAllowedPercentageField = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (!floatValue) {
      return true;
    }

    if (floatValue < 0) {
      return false;
    }

    const maxPercentage = isEditing
      ? 100 -
        (prevInvoicesPercentage -
          (invoice.additionalInfo.payment?.percentage ?? 0))
      : 100 - prevInvoicesPercentage;

    return floatValue <= maxPercentage;
  };

  const amount =
    formik.values.payment?.type === PaymentType.LUMP_SUM
      ? formik.values.payment?.amount?.value ?? 0
      : formik.values.payment?.type === PaymentType.PERCENTAGE
      ? (subtotalExclVat * (formik.values.payment?.percentage ?? 0)) / 100
      : 0;

  const totalAmountExclVat = isEditing
    ? amount +
      previousInvoicesTotalExclVat -
      (invoice.totalAmount?.netAmount ?? 0) /
        10 ** (invoice.totalAmount?.fractionDigits ?? 2)
    : amount + previousInvoicesTotalExclVat;
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

  const hasPreviousInvoices = previousInvoices.length > 0;

  useEffect(() => {
    const firstInvoice = previousInvoices[0];
    const firstInvoicePaymentType = firstInvoice?.additionalInfo.payment?.type;
    const isFinalAfterPreviousInvoices =
      hasPreviousInvoices && formik.values.type === InvoiceType.FINAL;
    const invoiceIndex = previousInvoices.length + 1;

    if (isEditing) {
      // do nothing
    } else if (isFinalAfterPreviousInvoices) {
      const description = `${invoiceIndex}. ${t('Final invoice')}`;
      // prefill percentage/amount if it's a final invoice after previous invoices
      formik.setFieldValue('payment', {
        ...formik.values.payment,
        ...(firstInvoicePaymentType === PaymentType.PERCENTAGE
          ? {
              type: PaymentType.PERCENTAGE,
              description,
              percentage: 100 - prevInvoicesPercentage,
            }
          : {
              type: PaymentType.LUMP_SUM,
              description,
              amount: {
                ...formik.values.payment?.amount,
                value: subtotalExclVat - previousInvoicesTotalExclVat,
              },
            }),
      });
    } else {
      // change payment type according to first invoice
      formik.setFieldValue('payment', {
        ...formik.values.payment,
        type:
          firstInvoicePaymentType === PaymentType.PERCENTAGE
            ? PaymentType.PERCENTAGE
            : PaymentType.LUMP_SUM,
        description: `${invoiceIndex}. ${t('Upfront invoice')}`,
      });
    }
  }, [previousInvoices]);

  useEffect(() => {
    // initialize payment object if it's not set
    if (invoice?.additionalInfo.payment && !formik.values.payment) {
      const amountMoney = aggregatedAmountToMoney(
        invoice.additionalInfo.payment.amount,
      );
      amountMoney.value =
        (amountMoney?.value ?? 0) / 10 ** (amountMoney?.fractionDigits ?? 2);
      formik.setFieldValue('payment', {
        ...invoice.additionalInfo.payment,
        amount: amountMoney,
      });
    }
  }, [invoice]);

  const paymentDescriptionError =
    getIn(formik.touched, 'payment.description') &&
    getIn(formik.errors, 'payment.description');

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
          {hasPreviousInvoices &&
            previousInvoices.map((prevInvoice) => (
              <Fragment key={prevInvoice.id}>
                <Grid item xs={7}>
                  <FormInput
                    props={{
                      size: 'small',
                      label: 'Name',
                      ...(prevInvoice.id === invoice?.id
                        ? {
                            name: 'payment.description',
                            value: formik.values.payment?.description,
                            onChange: formik.handleChange,
                            onBlur: formik.handleBlur,
                            required: true,
                            error: !!paymentDescriptionError,
                            helperText: paymentDescriptionError,
                          }
                        : {
                            value:
                              prevInvoice.type === InvoiceType.CREDIT_NOTE
                                ? t('Credit Note invoice')
                                : prevInvoice.additionalInfo.payment
                                    ?.description || '',
                            disabled: true,
                          }),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  display="flex"
                  justifyContent="flex-end"
                  gap={2}>
                  {formik.values.payment?.type === PaymentType.PERCENTAGE && (
                    <FormInput
                      inputType="currency"
                      {...(prevInvoice.id === invoice?.id && {
                        onValueChange: handleUpfrontPaymentChange,
                      })}
                      props={{
                        value:
                          prevInvoice.id === invoice?.id
                            ? formik.values.payment?.percentage
                            : prevInvoice.additionalInfo.payment?.percentage ??
                              0,
                        size: 'small',
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
                        disabled: prevInvoice.id !== invoice?.id,
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
                          onValueChange: handleUpfrontPaymentChange,
                        }
                      : {})}
                    props={{
                      value:
                        prevInvoice.id === invoice?.id
                          ? amount
                          : (prevInvoice.totalAmount?.netAmount ?? 0) /
                            10 **
                              (prevInvoice.totalAmount?.fractionDigits ?? 2),
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
                      ...(prevInvoice.id === invoice?.id
                        ? {
                            disabled:
                              formik.values.payment?.type ===
                              PaymentType.PERCENTAGE,
                          }
                        : {
                            disabled: true,
                          }),
                      isAllowed: isAllowedAmountField,
                      allowLeadingZeros: false,
                    }}
                  />
                </Grid>
              </Fragment>
            ))}
          {isEditing ? null : (
            <>
              <Grid item xs={7}>
                <FormInput
                  props={{
                    size: 'small',
                    label: 'Name',
                    name: 'payment.description',
                    value: formik.values.payment?.description,
                    onChange: formik.handleChange,
                    onBlur: formik.handleBlur,
                    required: true,
                    error: !!paymentDescriptionError,
                    helperText: paymentDescriptionError,
                  }}
                />
              </Grid>
              <Grid
                item
                xs={4}
                display="flex"
                justifyContent="flex-end"
                gap={2}>
                {formik.values.payment?.type === PaymentType.PERCENTAGE && (
                  <FormInput
                    inputType="currency"
                    onValueChange={handleUpfrontPaymentChange}
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
                        onValueChange: handleUpfrontPaymentChange,
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
            </>
          )}
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
            {T('Total amount (excl. VAT)')}
          </Typography>

          <Typography variant="subtitle2" color="primary.dark">
            {totalAmountExclVatFormatted}
          </Typography>

          {allItemsHasSameVAT ? (
            <>
              <Typography variant="body1" color="primary.dark">
                {T('VAT')} {percentageVats?.[0]?.percentageVat ?? 0}%
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
                  {T('VAT')} {v.percentageVat}%
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
            {T('Total amount (incl. VAT)')}
          </Typography>
          <Typography variant="subtitle1" color="primary.dark" fontWeight={600}>
            {totalAmountInclVatsFormatted}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
};
