import React, {useContext, useEffect} from 'react';
import {t} from 'i18next';
import {theme} from 'theme';
import {
  Grid,
  Typography,
  Box,
  InputAdornment,
  Divider,
  TextField,
  TableContainer,
  Table as MuiTable,
  tableCellClasses,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableCellProps,
} from '@mui/material';
import {FormikProps} from 'formik';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {FormInput} from 'components/form/FormInput';
import {
  InvoiceFormData,
  InvoiceType,
  InvoiceView,
  PaymentType,
} from 'models/invoice';
import {LanguageContext} from 'context/LanguageProvider';
import {
  formatCurrency,
  getCurrencySymbol,
  useCurrentCurrency,
} from 'utils/currency';
import {
  calculateTotalAmountInclVats,
  calculateTotalWithPerItemDiscount,
} from 'utils/calculate-total';
import {fixRounding} from 'utils/utils';
import {formatDate, toDate} from 'utils/datetime';
import {ReactComponent as PartialInvoiceIcon} from 'assets/icons/PartialInvoiceIcon.svg';
import {getAggregatedPartialPaymentsVats} from './utils';
import {SectionTitle} from './SectionTitle';

interface TableProps extends React.ComponentProps<typeof MuiTable> {
  children: React.ReactNode;
}

const Table = ({children, ...props}: TableProps) => (
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
      },
      [`& .${tableCellClasses.body}`]: {
        px: 0.5,
        pb: 0,
        color: 'primary.dark',
        verticalAlign: 'top',
        '& p': {
          mt: 0,
        },
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
}

export const PartialPaymentsSection = ({formik, previousInvoices}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const {language: selectedLng} = useContext(LanguageContext);

  const handlePartialPaymentChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (formik.values.payment?.type === PaymentType.LUMP_SUM) {
      formik.setFieldValue('payment', {
        ...formik.values.payment,
        amount: {
          value: floatValue || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    }
  };

  const previousInvoicesTotalExclVat = previousInvoices
    .map(
      (invoice) =>
        (invoice.totalAmount?.netAmount ?? 0) /
        10 ** (invoice.totalAmount?.fractionDigits ?? 2),
    )
    .reduce((a, b) => a + b, 0);
  const amount = formik.values.payment?.amount?.value ?? 0;
  const amountFormatted = formatCurrency(amount, {
    currency: currentCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
  });
  const totalAmountExclVat = amount + previousInvoicesTotalExclVat;
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

  useEffect(() => {
    // prefill amount if it's a final invoice after partial invoices
    const isFinalAfterPartial =
      previousInvoices.length > 1 && formik.values.type === InvoiceType.FINAL;
    if (
      isFinalAfterPartial &&
      formik.values.payment?.type === PaymentType.LUMP_SUM
    ) {
      const subtotalExclVat = calculateTotalWithPerItemDiscount(formik.values);
      formik.setFieldValue('payment', {
        ...formik.values.payment,
        amount: {
          ...formik.values.payment?.amount,
          value: subtotalExclVat - previousInvoicesTotalExclVat,
        },
      });
    }
  }, []);

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
        {t('Invoiced')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {invoicedSectionColumns.map((column) => (
                <TableCell key={column.name} align={column.align || 'left'}>
                  {t(column.name)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previousInvoices.map((invoice, index) => {
              const invoiceTotalAmount = invoice.totalAmount;
              const fractionDigits = invoiceTotalAmount?.fractionDigits ?? 2;
              const amountExclVat =
                (invoiceTotalAmount?.netAmount ?? 0) / 10 ** fractionDigits;
              const amountExclVatFormatted = formatCurrency(amountExclVat, {
                currency: currentCurrency.code,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
                roundingMode: 'floor',
              });
              const totalAmountInclVat =
                (invoiceTotalAmount?.grossAmount ?? 0) / 10 ** fractionDigits;
              const totalAmountInclVatFormatted = formatCurrency(
                totalAmountInclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: fractionDigits,
                  maximumFractionDigits: fractionDigits,
                  roundingMode: 'floor',
                },
              );
              return (
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell width="25%">
                    {invoice.additionalInfo?.payment?.description ?? ''}
                  </TableCell>
                  <TableCell>
                    {invoice.sentDate
                      ? formatDate(toDate(invoice.sentDate))
                      : '-'}
                  </TableCell>
                  <TableCell align="right">-{amountExclVatFormatted}</TableCell>
                  <TableCell align="right">
                    {invoiceTotalAmount.vats.map((v, idx) => (
                      <p key={idx}>{v.percentageVat}%</p>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    {invoiceTotalAmount.vats.map((v, idx) => {
                      const vatAmount = (v?.vat ?? 0) / 10 ** fractionDigits;
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
                    -{totalAmountInclVatFormatted}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell />
              <TableCell width="25%">{t('Invoice amount')}</TableCell>
              <TableCell />
              <TableCell align="right">{amountFormatted}</TableCell>
              <TableCell align="right">
                {currentInvoiceAmountPercentageVats.map((v, idx) => (
                  <p key={idx}>{v.percentageVat}%</p>
                ))}
              </TableCell>
              <TableCell align="right">
                {currentInvoiceAmountPercentageVats.map((v, idx) => {
                  const vatAmountFormatted = formatCurrency(v.vat, {
                    currency: currentCurrency.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    roundingMode: 'floor',
                  });
                  return <p key={idx}>{vatAmountFormatted}</p>;
                })}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(
                  amount +
                    currentInvoiceAmountPercentageVats
                      .map((v) => v.vat)
                      .reduce((a, b) => a + b, 0),
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
    // TODO: as discussed with marius, we will add these columns when we have data for it
    // {name: 'Paid amount (excl. VAT)', align: 'right'},
    // {name: 'VAT (%)', align: 'right'},
    // {name: 'VAT amount', align: 'right'},
    {name: 'Total amount (incl. VAT)', align: 'right'},
  ];

  const paidAmountInclVats = previousInvoices
    .map((i) =>
      i.payments.reduce(
        (acc, p) =>
          acc + (p.amount?.value ?? 0) / 10 ** (p.amount?.fractionDigits ?? 2),
        0,
      ),
    )
    .reduce((acc, a) => acc + a, 0);
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
        {t('Payment history')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {paymentHistorySectionColumns.map((column) => (
                <TableCell key={column.name} align={column.align || 'left'}>
                  {t(column.name)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell />
              <TableCell width="40%">{t('Total amount (incl. VAT)')}</TableCell>
              <TableCell />
              <TableCell align="right">
                {totalAmountInclVatsFormatted}
              </TableCell>
            </TableRow>
            {previousInvoices.map((invoice, index) => {
              if (!invoice.payments.length) {
                return null;
              }

              const totalPriceInclVat = invoice.payments
                .map(
                  (p) =>
                    (p.amount?.value ?? 0) /
                    10 ** (p.amount?.fractionDigits ?? 2),
                )
                .reduce((a, b) => a + b, 0);

              const totalPriceInclVatFormatted = formatCurrency(
                totalPriceInclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  roundingMode: 'floor',
                },
              );
              return (
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell width="40%">
                    {invoice.additionalInfo?.payment?.description ?? ''}
                  </TableCell>
                  <TableCell>
                    {invoice.sentDate
                      ? formatDate(toDate(invoice.sentDate))
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    -{totalPriceInclVatFormatted}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell />
              <TableCell width="40%" sx={{typography: 'h6', fontWeight: 600}}>
                {t('Outstanding payments')}
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {outstandingAmountFormatted}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const hasPayments = previousInvoices.map((i) => i.payments).flat().length > 0;

  return (
    <Grid item xs={12} bgcolor="white" p={3}>
      <Box pb={2}>
        <SectionTitle Icon={PartialInvoiceIcon} title="Partial Payments" />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        rowGap={2.5}
        border="1px solid"
        borderColor="action.focus"
        borderRadius={1}
        p={2}>
        <Grid container rowGap={2.5}>
          {previousInvoices.length > 0 &&
            previousInvoices.map((prevInvoice) => (
              <>
                <Grid item xs={8}>
                  <FormInput
                    props={{
                      size: 'small',
                      label: 'Name',
                      value:
                        prevInvoice.additionalInfo.payment?.description ?? '',
                      disabled: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4} display="flex" justifyContent="flex-end">
                  <NumericFormat
                    value={
                      (prevInvoice.totalAmount?.netAmount ?? 0) /
                      10 ** (prevInvoice.totalAmount?.fractionDigits ?? 2)
                    }
                    disabled
                    customInput={TextField}
                    label={t('Amount (excl. VAT)')}
                    decimalScale={2}
                    decimalSeparator={
                      selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                    }
                    thousandSeparator={
                      selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                    }
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {
                            getCurrencySymbol[
                              prevInvoice.totalAmount?.currency ?? 'EUR'
                            ]
                          }
                        </InputAdornment>
                      ),
                      inputProps: {
                        style: {textAlign: 'right'},
                      },
                    }}
                  />
                </Grid>
              </>
            ))}
          <Grid item xs={8}>
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
          <Grid item xs={4} display="flex" justifyContent="flex-end">
            <NumericFormat
              value={
                formik.values.payment?.type === PaymentType.LUMP_SUM
                  ? amount
                  : formik.values.payment?.percentage
              }
              isAllowed={(values) => {
                const {floatValue} = values;
                if (!floatValue) {
                  return true;
                }

                if (floatValue < 0) {
                  return false;
                }

                return true;
              }}
              customInput={TextField}
              label={t('Amount (excl. VAT)')}
              allowLeadingZeros={false}
              decimalScale={2}
              decimalSeparator={
                selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
              }
              thousandSeparator={
                selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
              }
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currentCurrency.symbol}
                  </InputAdornment>
                ),
                inputProps: {
                  style: {textAlign: 'right'},
                },
              }}
              onValueChange={handlePartialPaymentChange}
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
              <>
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
              </>
            ))
          )}
          <Typography variant="subtitle1" color="primary.dark" fontWeight={600}>
            {t('Total amount (incl. VAT)')}
          </Typography>
          <Typography variant="subtitle1" color="primary.dark" fontWeight={600}>
            {totalAmountInclVatsFormatted}
          </Typography>
        </Box>

        {previousInvoices.length > 0 && (
          <>
            {/* INVOICED SECTION */}
            <Divider sx={{borderColor: theme.palette.grey[300]}} />
            {renderInvoicedSection()}

            {/* PAYMENT HISTORY SECTION */}
            {hasPayments ? (
              <>
                <Divider sx={{borderColor: theme.palette.grey[300]}} />
                {renderPaymentHistorySection()}
              </>
            ) : null}
          </>
        )}
      </Box>
    </Grid>
  );
};
