import {Fragment, useContext, useEffect} from 'react';
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
import BigNumber from 'bignumber.js';
import {NumberFormatValues} from 'react-number-format';
import {FormInput} from 'components/form/FormInput';
import {
  AggregatedAmount,
  DiscountType,
  InvoiceAmountDetail,
  InvoiceFormData,
  InvoiceType,
  InvoiceView,
  PaymentType,
} from 'models/invoice';
import {
  aggregatedAmountToMoney,
  centsToMoney,
  formatCurrency,
  useCurrentCurrency,
} from 'utils/currency';
import {calculateTotalWithPerItemDiscount} from 'utils/calculate-total';
import {fixRounding} from 'utils/utils';
import {ReactComponent as UpfrontInvoiceIcon} from 'assets/icons/UpfrontInvoiceIcon.svg';
import {applyDiscount, correctCreditNoteInvoicesPercentages} from './utils';
import {SectionTitle} from './SectionTitle';
import {T} from 'utils/i18n-utils';
import {formatDate, toDate} from 'utils/datetime';
import {State} from 'models/misc';
import {UseFormReturn} from 'react-hook-form';
import {LanguageContext} from 'context/LanguageProvider';

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
  formMethods: UseFormReturn<InvoiceFormData>;
  previousInvoices: InvoiceView[];
  onRecalcInvoice: () => void;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
}

export const UpfrontPaymentsSection = ({
  formMethods,
  previousInvoices: allPreviousInvoices,
  onRecalcInvoice,
  invoice,
  invoiceAmountDetail,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const isEditing = !!invoice;
  // if editing, we need to show only past invoices till this one (editing invoice included)
  // if creating, we need to show all invoices

  const {language: selectedLng} = useContext(LanguageContext);
  const {setValue, watch, getValues, formState} = formMethods;

  const watchedPayment = watch('payment');
  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');
  const watchedInvoiceType = watch('type');

  const previousInvoices = correctCreditNoteInvoicesPercentages(
    isEditing
      ? allPreviousInvoices.slice(
          0,
          allPreviousInvoices.findIndex((i) => i.id === invoice.id) + 1,
        )
      : allPreviousInvoices,
  );

  const subtotalExclVatAfterPerItemDiscount =
    calculateTotalWithPerItemDiscount(watchedItems);

  const subtotalExclVat = applyDiscount({
    actualValue: subtotalExclVatAfterPerItemDiscount,
    ...(watchedDiscount?.type === DiscountType.AMOUNT
      ? {amount: watchedDiscount?.amount?.value ?? 0}
      : {percentage: watchedDiscount?.percentage ?? 0}),
  });

  const handleUpfrontPaymentChange = (values: {
    name?: string;
    value?: number;
  }) => {
    const {value} = values;
    if (watchedPayment?.type === PaymentType.LUMP_SUM) {
      setValue('payment', {
        ...watchedPayment,
        amount: {
          value: value || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    } else if (watchedPayment?.type === PaymentType.PERCENTAGE) {
      setValue('payment', {
        ...watchedPayment,
        percentage: value || 0,
      });
    }
    onRecalcInvoice();
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

    if (floatValue < 0 || watchedPayment?.type === PaymentType.PERCENTAGE) {
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
    watchedPayment?.type === PaymentType.LUMP_SUM
      ? watchedPayment?.amount?.value ?? 0
      : watchedPayment?.type === PaymentType.PERCENTAGE
      ? (subtotalExclVat * (watchedPayment?.percentage ?? 0)) / 100
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

  const percentageVats =
    (invoiceAmountDetail?.payment?.amount as AggregatedAmount)?.vats ?? [];

  const totalAmountInclVats =
    (percentageVats
      ?.map((v) => centsToMoney(currentCurrency?.code!, v.vat))
      ?.reduce((a, b) => a + b, 0) ?? 0) + totalAmountExclVat;

  const totalAmountInclVatsFormatted = formatCurrency(
    fixRounding(totalAmountInclVats, 2),
    {
      currency: currentCurrency?.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      excludeCurrencySymbol: true,
      currencySymbol: currentCurrency?.symbol,
      companyLang: selectedLng,
    },
  );

  const hasPreviousInvoices = previousInvoices.length > 0;

  useEffect(() => {
    const firstInvoice = previousInvoices[0];
    const firstInvoicePayment = firstInvoice?.additionalInfo.payment;
    const firstInvoicePaymentType = firstInvoicePayment?.type;
    const isFinalAfterPreviousInvoices =
      hasPreviousInvoices && watchedInvoiceType === InvoiceType.FINAL;
    const invoiceIndex = previousInvoices?.length + 1;
    const articlesAreSame =
      ((firstInvoicePayment?.amount?.netAmount || 0) /
        (subtotalExclVat * 100)) *
        100 ===
      firstInvoicePayment?.percentage;

    if (isEditing) {
      // do nothing if editing
    } else if (isFinalAfterPreviousInvoices) {
      const description = `${invoiceIndex}. ${t('Final invoice')}`;
      // prefill percentage/amount if it's a final invoice after previous invoices
      if (watchedPayment?.description !== description) {
        setValue('payment', {
          ...watchedPayment,
          ...(firstInvoicePaymentType === PaymentType.PERCENTAGE &&
          articlesAreSame
            ? {
                type: PaymentType.PERCENTAGE,
                description,
                percentage: 100 - prevInvoicesPercentage,
              }
            : {
                type: PaymentType.LUMP_SUM,
                description,
                amount: {
                  ...watchedPayment?.amount,
                  value: subtotalExclVat - previousInvoicesTotalExclVat,
                  currency:
                    watchedPayment?.amount?.currency || currentCurrency.code,
                },
              }),
        });
      }
    } else {
      // change payment type according to first invoice
      const description = `${invoiceIndex}. ${t('Upfront invoice')}`;
      if (watchedPayment?.description !== description) {
        setValue('payment', {
          ...watchedPayment,
          type:
            firstInvoicePaymentType === PaymentType.PERCENTAGE &&
            articlesAreSame
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
    if (invoice?.additionalInfo?.payment && !watchedPayment) {
      const amountMoney = aggregatedAmountToMoney(
        invoice.additionalInfo.payment.amount,
      );
      amountMoney.value =
        (amountMoney?.value ?? 0) / 10 ** (amountMoney?.fractionDigits ?? 2);
      setValue('payment', {
        ...invoice.additionalInfo.payment,
        amount: amountMoney,
      });
    }
  }, [invoice]);

  const paymentDescriptionError: string | undefined = formState.touchedFields
    ?.payment?.description
    ? formState.errors?.payment?.description?.message
    : undefined;

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
                {percentageVats?.map((v, idx) => (
                  <p key={idx}>{v.percentageVat}%</p>
                ))}
              </TableCell>
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {percentageVats?.map((v, idx) => {
                  const vatAmountFormatted = formatCurrency(
                    centsToMoney(currentCurrency?.code!, v.vat),
                    {
                      currency: currentCurrency?.code,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      companyLang: selectedLng,
                      currencySymbol: currentCurrency?.symbol,
                    },
                  );
                  return <p key={idx}>{vatAmountFormatted}</p>;
                })}
              </TableCell>
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {formatCurrency(
                  amount +
                    percentageVats
                      ?.map((v) => centsToMoney(currentCurrency?.code!, v.vat))
                      ?.reduce((a, b) => a + b, 0),
                  {
                    currency: currentCurrency.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
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
      i.payments
        ?.filter((payment) => payment.meta.state === State.ACTIVE)
        .reduce(
          (acc, p) =>
            acc +
            (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
          0,
        ),
    )
    ?.reduce((acc, a) => acc + a, 0);
  const outstandingPayments = BigNumber(totalAmountInclVats)
    .minus(paidAmountInclVats)
    .toNumber();
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
              if (
                !i.payments?.filter(
                  (payment) => payment.meta.state === State.ACTIVE,
                ).length
              ) {
                return null;
              }

              const description =
                i.type === InvoiceType.CREDIT_NOTE
                  ? t('Credit Note invoice')
                  : i.additionalInfo?.payment?.description || '';

              const paidAmountExclVat = Math.abs(
                i.payments
                  ?.filter((payment) => payment.meta.state === State.ACTIVE)
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
                  ?.filter((payment) => payment.meta.state === State.ACTIVE)
                  ?.map((p) => p.additionalInfo.paymentDetails?.vats)
                  ?.flat(),
              );

              const totalPriceInclVat = Math.abs(
                i.payments
                  ?.filter((payment) => payment.meta.state === State.ACTIVE)
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
    previousInvoices
      ?.map((i) =>
        i.payments?.filter((payment) => payment.meta.state === State.ACTIVE),
      )
      .flat().length > 0;

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
                            value: watchedPayment?.description,
                            onChange: (
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setValue('payment', {
                                ...getValues('payment'),
                                type: getValues('payment')?.type!,
                                description: e.target.value,
                              }),
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
                  {watchedPayment?.type === PaymentType.PERCENTAGE && (
                    <FormInput
                      inputType="currency"
                      {...(prevInvoice.id === invoice?.id && {
                        onValueChange: handleUpfrontPaymentChange,
                      })}
                      fieldProps={{
                        value:
                          prevInvoice.id === invoice?.id
                            ? watchedPayment?.percentage
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
                    {...(watchedPayment?.type === PaymentType.LUMP_SUM
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
                              watchedPayment?.type === PaymentType.PERCENTAGE,
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
                    value: watchedPayment?.description,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      setValue('payment', {
                        ...getValues('payment'),
                        type: getValues('payment')?.type!,
                        description: e.target.value,
                      }),
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
                {watchedPayment?.type === PaymentType.PERCENTAGE && (
                  <FormInput
                    inputType="currency"
                    onValueChange={handleUpfrontPaymentChange}
                    fieldProps={{
                      value: watchedPayment?.percentage,
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
                  {...(watchedPayment?.type === PaymentType.LUMP_SUM
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
                    disabled: watchedPayment?.type === PaymentType.PERCENTAGE,
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

          {percentageVats?.map((v) => (
            <Fragment key={v.percentageVat}>
              <Typography variant="body1" color="primary.dark">
                {T('VAT')} {v.percentageVat}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {formatCurrency(centsToMoney(currentCurrency?.code!, v.vat), {
                  currency: currentCurrency?.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  excludeCurrencySymbol: true,
                  companyLang: selectedLng,
                  currencySymbol: currentCurrency?.symbol,
                })}
              </Typography>
            </Fragment>
          ))}
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
