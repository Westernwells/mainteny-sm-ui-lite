import {Fragment, useEffect} from 'react';
import {t} from 'i18next';
import {uniq} from 'lodash';
import {theme} from 'theme';
import {
  Grid,
  Typography,
  Box,
  InputAdornment,
  Divider,
  TableCellProps,
  TableContainer,
  Table as MuiTable,
  SxProps,
  tableCellClasses,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {FormikProps, getIn} from 'formik';
import {NumberFormatValues} from 'react-number-format';
import {FormInput} from 'components/form/FormInput';
import {
  DiscountType,
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
import {
  applyDiscount,
  correctCreditNoteInvoicesPercentages,
  getAggregatedPartialPaymentsVats,
} from './utils';
import {SectionTitle} from './SectionTitle';
import {T} from 'utils/i18n-utils';
import {formatDate, toDate} from 'utils/datetime';

interface TableProps extends React.ComponentProps<typeof MuiTable> {
  children: React.ReactNode;
  headStyles?: SxProps;
  bodyStyles?: SxProps;
}

const Table = ({children, headStyles, bodyStyles, ...props}: TableProps) => (
  <MuiTable
    sx={{
      minWidth: 700,
      [`& .${tableCellClasses.root}`]: {
        borderBottom: 'none',
        borderSpacing: '0 1rem',
      },
      [`& .${tableCellClasses.head}`]: {
        p: 0,
        px: 0.5,
        color: 'text.secondary',
        typography: 'caption',
        ...headStyles,
      },
      [`& .${tableCellClasses.body}`]: {
        px: 0.5,
        pb: 0,
        color: 'primary.dark',
        verticalAlign: 'top',
        '& p': {
          mt: 0,
        },
        ...bodyStyles,
      },
      '& .MuiOutlinedInput-root': {
        fieldset: {
          borderColor: '#E4E9F2',
        },
      },
    }}
    {...props}>
    {children}
  </MuiTable>
);

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
  const previousInvoices = correctCreditNoteInvoicesPercentages(
    isEditing
      ? allPreviousInvoices.slice(
          0,
          allPreviousInvoices.findIndex((i) => i.id === invoice.id) + 1,
        )
      : allPreviousInvoices,
  );

  const subtotalExclVatAfterPerItemDiscount = calculateTotalWithPerItemDiscount(
    formik.values.items,
  );
  const subtotalExclVat = applyDiscount({
    actualValue: subtotalExclVatAfterPerItemDiscount,
    ...(formik.values.discount?.type === DiscountType.AMOUNT
      ? {amount: formik.values.discount?.amount?.value ?? 0}
      : {percentage: formik.values.discount?.percentage ?? 0}),
  });

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
    ?.map(
      (i) =>
        (i.totalAmount?.netAmount ?? 0) /
        10 ** (i.totalAmount?.fractionDigits ?? 2),
    )
    ?.reduce((a, b) => a + b, 0);

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
    ?.map((i) => i.additionalInfo.payment?.percentage ?? 0)
    ?.reduce((a, b) => a + b, 0);

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

  const amountFormatted = formatCurrency(fixRounding(amount, 2), {
    currency: currentCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
  });

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
  const currentInvoiceAmountPercentageVats = formik.values.items.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: formik.values.items[0].unitAmount.percentageVat,
            vat:
              amount * (formik.values.items[0].unitAmount.percentageVat / 100),
          },
        ]
      : getAggregatedPartialPaymentsVats(formik.values.items, amount)
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
    const firstInvoicePaymentType = firstInvoice?.additionalInfo?.payment?.type;
    const isFinalAfterPreviousInvoices =
      hasPreviousInvoices && formik.values.type === InvoiceType.FINAL;
    const invoiceIndex = previousInvoices?.length + 1;

    if (isEditing) {
      // do nothing if editing
    } else if (isFinalAfterPreviousInvoices) {
      const description = `${invoiceIndex}. ${t('Final invoice')}`;
      // prefill percentage/amount if it's a final invoice after previous invoices
      if (formik.values.payment?.description !== description) {
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
      }
    } else {
      // change payment type according to first invoice
      const description = `${invoiceIndex}. ${t('Upfront invoice')}`;
      if (formik.values.payment?.description !== description) {
        formik.setFieldValue('payment', {
          ...formik.values.payment,
          type:
            firstInvoicePaymentType === PaymentType.PERCENTAGE
              ? PaymentType.PERCENTAGE
              : PaymentType.LUMP_SUM,
          description,
        });
      }
    }
  }, [previousInvoices]);

  useEffect(() => {
    if (!invoice) return;
    // initialize payment object if it's not set
    if (invoice?.additionalInfo?.payment && !formik.values.payment) {
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

  const invoicedSectionColumns: {
    name: string;
    align?: TableCellProps['align'];
  }[] = [
    {name: '#'},
    {name: 'Name'},
    {name: 'Invoice Date'},
    {name: 'Amount (excl. VAT)', align: 'right'},
    {name: 'VAT (%)', align: 'right'},
    {name: 'VAT amount', align: 'right'},
    {name: 'Total amount (incl. VAT)', align: 'right'},
  ];

  const renderInvoicedSection = () => (
    <>
      <Typography variant="h6" color="primary.dark">
        {T('Invoiced')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {invoicedSectionColumns.map((column) => (
                <TableCell key={column.name} align={column.align || 'left'}>
                  {T(column.name)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previousInvoices?.map((i, index) => {
              // don't render anything for the editing invoice
              if (isEditing && index === previousInvoices.length - 1) {
                return null;
              }
              const invoiceTotalAmount = i.totalAmount;
              const description =
                i.type === InvoiceType.CREDIT_NOTE
                  ? t('Credit Note invoice')
                  : i.additionalInfo?.payment?.description || '';
              const fractionDigits = invoiceTotalAmount?.fractionDigits ?? 2;
              const amountExclVat = Math.abs(
                (invoiceTotalAmount?.netAmount ?? 0) / 10 ** fractionDigits,
              );
              const amountExclVatFormatted = formatCurrency(amountExclVat, {
                currency: currentCurrency.code,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
                roundingMode: 'floor',
              });
              const totalAmountInclVat = Math.abs(
                (invoiceTotalAmount?.grossAmount ?? 0) / 10 ** fractionDigits,
              );
              const totalAmountInclVatFormatted = formatCurrency(
                totalAmountInclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: fractionDigits,
                  maximumFractionDigits: fractionDigits,
                  roundingMode: 'floor',
                },
              );
              const signBeforeNumber =
                i.type === InvoiceType.CREDIT_NOTE ? '+' : '-';

              return (
                <TableRow key={i.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell width="25%">{description}</TableCell>
                  <TableCell>
                    {i.sentDate ? formatDate(toDate(i.sentDate)) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {signBeforeNumber}
                    {amountExclVatFormatted}
                  </TableCell>
                  <TableCell align="right">
                    {invoiceTotalAmount?.vats?.map((v, idx) => (
                      <p key={idx}>{v.percentageVat}%</p>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    {invoiceTotalAmount?.vats?.map((v, idx) => {
                      const vatAmount = Math.abs(
                        (v?.vat ?? 0) / 10 ** fractionDigits,
                      );
                      const vatAmountFormatted = formatCurrency(vatAmount, {
                        currency: currentCurrency.code,
                        minimumFractionDigits: fractionDigits,
                        maximumFractionDigits: fractionDigits,
                        roundingMode: 'floor',
                      });
                      return <p key={idx}>{vatAmountFormatted}</p>;
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {signBeforeNumber}
                    {totalAmountInclVatFormatted}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow
              sx={{
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                },
              }}>
              <TableCell />
              <TableCell width="25%" sx={{typography: 'h6', fontWeight: 600}}>
                {T('Invoice amount')}
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {amountFormatted}
              </TableCell>
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {currentInvoiceAmountPercentageVats?.map((v, idx) => (
                  <p key={idx}>{v.percentageVat}%</p>
                ))}
              </TableCell>
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {currentInvoiceAmountPercentageVats?.map((v, idx) => {
                  const vatAmountFormatted = formatCurrency(v.vat, {
                    currency: currentCurrency.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    roundingMode: 'floor',
                  });
                  return <p key={idx}>{vatAmountFormatted}</p>;
                })}
              </TableCell>
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {formatCurrency(
                  amount +
                    currentInvoiceAmountPercentageVats
                      ?.map((v) => v.vat)
                      ?.reduce((a, b) => a + b, 0),
                  {
                    currency: currentCurrency.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    roundingMode: 'floor',
                  },
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const paymentHistorySectionColumns: {
    name: string;
    align?: TableCellProps['align'];
  }[] = [
    {name: '#'},
    {name: 'Name'},
    {name: 'Invoice Date'},
    {name: 'Paid amount (excl. VAT)', align: 'right'},
    {name: 'VAT (%)', align: 'right'},
    {name: 'VAT amount', align: 'right'},
    {name: 'Total amount (incl. VAT)', align: 'right'},
  ];

  const paidAmountInclVats = previousInvoices
    ?.map((i) =>
      i.payments.reduce(
        (acc, p) =>
          acc + (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
        0,
      ),
    )
    ?.reduce((acc, a) => acc + a, 0);
  const outstandingPayments = totalAmountInclVats - paidAmountInclVats;
  const outstandingAmountFormatted = formatCurrency(outstandingPayments, {
    currency: currentCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
  });

  const renderPaymentHistorySection = () => (
    <>
      <Typography variant="h6" color="primary.dark">
        {T('Payment history')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {paymentHistorySectionColumns.map((column) => (
                <TableCell key={column.name} align={column.align || 'left'}>
                  {T(column.name)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell />
              <TableCell width="40%">{T('Total amount (incl. VAT)')}</TableCell>
              <TableCell align="right" colSpan={5}>
                {totalAmountInclVatsFormatted}
              </TableCell>
            </TableRow>
            {previousInvoices?.map((i, index) => {
              if (!i.payments.length) {
                return null;
              }

              const description =
                i.type === InvoiceType.CREDIT_NOTE
                  ? t('Credit Note invoice')
                  : i.additionalInfo?.payment?.description || '';

              const paidAmountExclVat = Math.abs(
                i.payments
                  ?.map(
                    (p) =>
                      (p.additionalInfo.paymentDetails?.netAmount ?? 0) /
                      10 **
                        (p.additionalInfo.paymentDetails?.fractionDigits ?? 2),
                  )
                  ?.reduce((a, b) => a + b, 0),
              );

              const paidAmountExclVatFormatted = formatCurrency(
                paidAmountExclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
                },
              );

              const percentageVats = uniq(
                i.payments
                  ?.map((p) => p.additionalInfo.paymentDetails?.vats)
                  ?.flat(),
              );

              const totalPriceInclVat = Math.abs(
                i.payments
                  ?.map(
                    (p) =>
                      (p.amount?.value ?? 0) /
                      10 ** (p.amount?.fractionDigits ?? 2),
                  )
                  .reduce((a, b) => a + b, 0),
              );

              const totalPriceInclVatFormatted = formatCurrency(
                totalPriceInclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
                },
              );
              const signBeforeNumber =
                i.type === InvoiceType.CREDIT_NOTE ? '+' : '-';

              return (
                <TableRow key={i.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell width="40%">{description}</TableCell>
                  <TableCell>
                    {i.sentDate ? formatDate(toDate(i.sentDate)) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {signBeforeNumber}
                    {paidAmountExclVatFormatted}
                  </TableCell>
                  <TableCell align="right">
                    {percentageVats?.map((pV) => (
                      <p key={pV?.percentageVat}>{pV?.percentageVat}%</p>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    {percentageVats?.map((pV, idx) => (
                      <p key={`${pV?.percentageVat}-${idx}`}>
                        {signBeforeNumber}
                        {formatCurrency(Math.abs((pV?.vat ?? 0) / 10 ** 2), {
                          currency: currentCurrency.code,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                          roundingMode: 'floor',
                        })}
                      </p>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    {signBeforeNumber}
                    {totalPriceInclVatFormatted}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell />
              <TableCell width="40%" sx={{typography: 'h6', fontWeight: 600}}>
                {T('Outstanding payments')}
              </TableCell>
              <TableCell
                align="right"
                colSpan={5}
                sx={{typography: 'h6', fontWeight: 600}}>
                {outstandingAmountFormatted}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const hasPayments =
    previousInvoices?.map((i) => i.payments).flat().length > 0;

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
            previousInvoices?.map((prevInvoice) => (
              <Fragment key={prevInvoice.id}>
                <Grid item xs={7}>
                  <FormInput
                    fieldProps={{
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
                      fieldProps={{
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
                    fieldProps={{
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
                  fieldProps={{
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
                    fieldProps={{
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
                  fieldProps={{
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
            percentageVats?.map((v) => (
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

        {hasPreviousInvoices ? (
          <>
            {/* INVOICED SECTION */}
            {/* if editing, show invoiced section if there is more than one previous invoice */}
            {!isEditing || (isEditing && previousInvoices.length > 1) ? (
              <>
                <Divider sx={{borderColor: theme.palette.grey[300]}} />
                {renderInvoicedSection()}
              </>
            ) : null}

            {/* PAYMENT HISTORY SECTION */}
            {hasPayments ? (
              <>
                <Divider sx={{borderColor: theme.palette.grey[300]}} />
                {renderPaymentHistorySection()}
              </>
            ) : null}
          </>
        ) : null}
      </Box>
    </Grid>
  );
};
