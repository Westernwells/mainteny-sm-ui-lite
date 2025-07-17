import React, {Fragment, useContext, useEffect} from 'react';
import {t} from 'i18next';
import {uniq} from 'lodash';
import {theme} from 'theme';
import {
  Box,
  Divider,
  Grid,
  InputAdornment,
  SxProps,
  Table as MuiTable,
  TableBody,
  TableCell,
  tableCellClasses,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {FormInput} from 'components/form/FormInput';
import {
  AggregatedAmount,
  DiscountType,
  InvoiceAmountDetail,
  InvoiceFormData,
  InvoiceItemPaymentType,
  InvoiceType,
  InvoiceView,
  PaymentType,
  EditableInvoiceItem,
} from 'models/invoice';
import {LanguageContext} from 'context/LanguageProvider';
import {
  centsToMoney,
  formatCurrency,
  getCurrencySymbol,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {fixRounding, isNumber} from 'utils/utils';
import {formatDate, toDate} from 'utils/datetime';
import {ReactComponent as PartialInvoiceIcon} from 'assets/icons/PartialInvoiceIcon.svg';
import {applyDiscount, correctCreditNoteInvoicesPercentages} from './utils';
import {SectionTitle} from './SectionTitle';
import {T} from 'utils/i18n-utils';
import {State} from 'models/misc';
import InvoiceShowOnPDFSwitch from 'components/Switch/InvoiceShowOnPDFSwitch';
import {stripHtmlTags} from 'utils/text-block';
import {UseFormReturn} from 'react-hook-form';
import {aggregateVats, collectVatsFromInvoices} from 'utils/invoice';

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

interface NameInputProps {
  formMethods: UseFormReturn<InvoiceFormData>;
  paymentDescriptionError?: string;
  disabledValue?: string;
}

const NameInput = ({
  formMethods,
  paymentDescriptionError,
  disabledValue,
}: NameInputProps) => (
  <FormInput
    fieldProps={{
      size: 'small',
      label: 'Name',
      ...(disabledValue
        ? {disabled: true, value: disabledValue}
        : {
            name: 'payment.description',
            value: formMethods.getValues('payment')?.description || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              formMethods.setValue('payment', {
                ...formMethods.getValues('payment'),
                type: formMethods.getValues('payment')?.type!,
                description: e.target.value,
              }),
            required: true,
            error: !!paymentDescriptionError,
            helperText: paymentDescriptionError,
          }),
    }}
  />
);

interface Props {
  formMethods: UseFormReturn<InvoiceFormData>;
  previousInvoices: InvoiceView[];
  onRecalcInvoice: () => void;
  invoice?: InvoiceView;
  invoiceAmountDetail?: InvoiceAmountDetail;
}

export const PartialPaymentsSection = ({
  formMethods,
  previousInvoices: allPreviousInvoices,
  onRecalcInvoice,
  invoice,
  invoiceAmountDetail,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const {language: selectedLng} = useContext(LanguageContext);
  const isEditing = !!invoice;
  // if editing, we need to show only past invoices till this one (editing invoice included)
  // if creating, we need to show all invoices

  const {setValue, watch, getValues, formState} = formMethods;

  const watchedPayment = watch('payment');
  const watchedItems = watch('items');
  const watchedInvoiceType = watch('type');
  const watchedShowInvoicedSection = watch('showInvoicedSection');
  const watchedShowPaymentSection = watch('showPaymentSection');

  const previousInvoices = correctCreditNoteInvoicesPercentages(
    isEditing
      ? allPreviousInvoices?.slice(
          0,
          allPreviousInvoices?.findIndex((i) => i.id === invoice?.id) + 1,
        )
      : allPreviousInvoices,
  );

  const subtotalExclVat = centsToMoney(
    currentCurrency?.code!,
    invoiceAmountDetail?.amountAfterGlobalDiscount?.netAmount ?? 0,
  );

  const handlePartialPaymentChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (watchedPayment?.type === PaymentType.LUMP_SUM) {
      setValue('payment', {
        ...getValues('payment'),
        type: getValues('payment')?.type!,
        amount: {
          value: floatValue || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    } else if (watchedPayment?.type === PaymentType.PERCENTAGE) {
      setValue('payment', {
        ...getValues('payment'),
        type: getValues('payment')?.type!,
        percentage: floatValue || 0,
      });
    }
    onRecalcInvoice();
  };

  const prevInvoicesExcludingCurrent = previousInvoices.filter(
    (i) => i.id !== invoice?.id,
  );

  const previousInvoicesTotalExclCurrentVat = centsToMoney(
    currentCurrency.code,
    prevInvoicesExcludingCurrent.reduce(
      (sum, i) => sum + (i.totalAmount?.netAmount || 0),
      0,
    ),
  );

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
      previousInvoicesTotalExclCurrentVat +
      (isEditing
        ? (invoice?.totalAmount?.netAmount ?? 0) /
          10 ** (invoice?.totalAmount?.fractionDigits ?? 2)
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
          (invoice?.additionalInfo?.payment?.percentage ?? 0))
      : 100 - prevInvoicesPercentage;

    return floatValue <= maxPercentage;
  };

  const paymentValue = watch('payment.amount.value') ?? 0;

  const currentInvoiceNet = centsToMoney(
    currentCurrency.code,
    (invoiceAmountDetail?.payment?.amount as AggregatedAmount)?.netAmount ?? 0,
  );

  const amountFormatted = formatCurrency(currentInvoiceNet, {
    currency: currentCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const totalAmountExclVat =
    currentInvoiceNet + previousInvoicesTotalExclCurrentVat;

  const totalAmountExclVatFormatted = formatCurrency(totalAmountExclVat, {
    currency: currentCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currentPercentageVats =
    (invoiceAmountDetail?.payment?.amount as AggregatedAmount)?.vats ?? [];

  const previousVats = collectVatsFromInvoices(prevInvoicesExcludingCurrent);

  const allVats = [...previousVats, ...currentPercentageVats];

  const finalAggregatedVats = aggregateVats(allVats);

  const totalAmountInclVats =
    (finalAggregatedVats
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
    const lastInvoice = previousInvoices[previousInvoices.length - 1];
    const firstInvoicePayment = firstInvoice?.additionalInfo.payment;
    const firstInvoicePaymentType = firstInvoicePayment?.type;
    const isFinalAfterPartial =
      hasPreviousInvoices && watchedInvoiceType === InvoiceType.FINAL;

    // if first invoice is upfront and 2nd or later invoice is partial, then invoice index should be different
    // for example, if there are no partial invoices,
    // 1. Upfront invoice
    // 2. Upfront invoice
    // 3. Final invoice
    // but if there are partial invoices,
    // 1. Upfront invoice
    // 1. Partial invoice
    // 2. Partial invoice
    // 3. Final invoice
    // see the change in invoice index above.

    const lastInvoiceDescription =
      lastInvoice?.additionalInfo.payment?.description;
    const lastInvoiceIndexString =
      lastInvoiceDescription?.split?.('.')?.[0] ?? '';
    const lastInvoiceIndexNumber = Number(lastInvoiceIndexString);
    const lastInvoiceIndex = isNumber(lastInvoiceIndexNumber)
      ? lastInvoiceIndexNumber
      : 0;
    const firstInvoiceIsUpfront = firstInvoice?.type === InvoiceType.UPFRONT;
    const lastInvoiceIsPartial = lastInvoice?.type === InvoiceType.PARTIAL;
    const invoiceIndex = firstInvoiceIsUpfront
      ? lastInvoiceIsPartial
        ? lastInvoiceIndex + 1
        : 1
      : previousInvoices.length + 1;
    const articlesAreSame =
      ((firstInvoicePayment?.amount?.netAmount || 0) /
        (subtotalExclVat * 100)) *
        100 ===
      firstInvoicePayment?.percentage;

    if (isEditing) {
      // do nothing if editing
    } else if (isFinalAfterPartial) {
      const description = `${invoiceIndex}. ${t('Final invoice')}`;
      // Check before setting the value to avoid unnecessary updates
      if (watchedPayment?.description !== description) {
        if (
          firstInvoicePaymentType === PaymentType.PERCENTAGE &&
          articlesAreSame
        ) {
          setValue('payment', {
            ...getValues('payment'),
            type: PaymentType.PERCENTAGE,
            description,
            percentage: 100 - prevInvoicesPercentage,
          });
        } else if (
          firstInvoicePaymentType === PaymentType.PER_ITEM ||
          (!articlesAreSame && firstInvoicePaymentType !== PaymentType.LUMP_SUM)
        ) {
          const getItemOverallPercentage = (
            item: EditableInvoiceItem,
          ): number => {
            const id = item.article?.id;
            const name = item.article?.name;
            if (id) {
              return previousInvoices
                ?.map((i) => i.items)
                ?.flat()
                ?.filter((i) => i.article?.id === id)
                ?.reduce(
                  (acc, i) =>
                    acc + (i.additionalInfo?.payment?.percentage ?? 0),
                  0,
                );
            }
            if (name) {
              return previousInvoices
                ?.map((i) => i.items)
                ?.flat()
                ?.filter((i) => i.article?.name === name)
                ?.reduce(
                  (acc, i) =>
                    acc + (i.additionalInfo?.payment?.percentage ?? 0),
                  0,
                );
            }
            return 0;
          };

          // Set payment type first
          setValue('payment', {
            ...getValues('payment'),
            type: PaymentType.PER_ITEM,
            description,
          });

          const updatedItems = getValues('items')?.map((item) => {
            const overallPercentage = getItemOverallPercentage(item);
            const remainingPercentage = 100 - (overallPercentage || 0);

            return {
              ...item,
              payment: {
                type: InvoiceItemPaymentType.PERCENTAGE,
                percentage: Math.max(0, remainingPercentage),
              },
            };
          });
          setValue('items', updatedItems);
        } else {
          setValue('payment', {
            ...getValues('payment'),
            type: PaymentType.LUMP_SUM,
            description,
            amount: {
              ...watchedPayment?.amount,
              currency:
                watchedPayment?.amount?.currency || currentCurrency.code,
              value: subtotalExclVat,
            },
          });
        }
      }
    } else {
      const description = `${invoiceIndex}. ${t('Partial invoice')}`;
      if (watchedPayment?.description !== description) {
        let newPayment = {
          ...getValues('payment'),
          type:
            firstInvoicePaymentType === PaymentType.PERCENTAGE
              ? PaymentType.PERCENTAGE
              : firstInvoicePaymentType === PaymentType.PER_ITEM
              ? PaymentType.PER_ITEM
              : PaymentType.LUMP_SUM,
          description,
        };

        if (newPayment.type === PaymentType.LUMP_SUM) {
          newPayment.amount = {
            value: 0,
            currency: currentCurrency.code,
            fractionDigits: currentCurrency.fractionDigits,
          };
        }

        if (newPayment.type === PaymentType.PERCENTAGE) {
          newPayment.percentage = 0;
        }

        if (newPayment.type === PaymentType.PER_ITEM) {
          const updatedItems = watchedItems?.map((item) => ({
            ...item,
            payment: {
              type: InvoiceItemPaymentType.PERCENTAGE,
              percentage: 0,
            },
          }));
          setValue('items', updatedItems);
        }

        setValue('payment', newPayment);
      }
    }
  }, [previousInvoices, formMethods]);

  const onInvoicedSectionToggle = (newState: boolean) => {
    setValue('showInvoicedSection', newState);
  };

  const onPaymentSectionToggle = (newState: boolean) => {
    setValue('showPaymentSection', newState);
  };

  const paymentDescriptionError: string | undefined = formState.touchedFields
    ?.payment?.description
    ? formState.errors?.payment?.description?.message
    : undefined;

  const perItemSectionColumns: {
    name: string;
    align?: TableCellProps['align'];
  }[] = [
    {name: '#'},
    {name: 'Name'},
    {name: 'Total price (excl. VAT)', align: 'right'},
    {name: 'Portion %', align: 'right'},
    {name: 'Amount to be paid', align: 'right'},
  ];

  const renderPerItemSection = () => {
    const getItemOverallPercentage = (item: EditableInvoiceItem): number => {
      const id = item.article?.id;
      const name = item.article?.name;
      if (id) {
        return previousInvoices
          ?.map((i) => i.items)
          ?.flat()
          ?.filter((i) => i.article?.id === id)
          ?.reduce(
            (acc, i) => acc + (i.additionalInfo?.payment?.percentage ?? 0),
            0,
          );
      }
      if (name) {
        return previousInvoices
          ?.map((i) => i.items)
          ?.flat()
          ?.filter((i) => i.article?.name === name)
          ?.reduce(
            (acc, i) => acc + (i.additionalInfo?.payment?.percentage ?? 0),
            0,
          );
      }
      return 0;
    };

    const isAllowedPortionField = (
      values: NumberFormatValues,
      item: EditableInvoiceItem,
    ) => {
      const {floatValue} = values;
      if (!floatValue) {
        return true;
      }

      if (floatValue < 0) {
        return false;
      }

      const prevInvoicesItemPercentage = getItemOverallPercentage(item);
      const maxPercentage = isEditing
        ? 100 -
          (prevInvoicesItemPercentage -
            (invoice.items.find((i) => i.article?.id === item.article?.id)
              ?.additionalInfo?.payment?.percentage ?? 0))
        : 100 - prevInvoicesItemPercentage;

      return floatValue <= maxPercentage;
    };

    return (
      <Grid container rowGap={4} justifyContent="space-between">
        {hasPreviousInvoices &&
          previousInvoices?.map((prevInvoice, idx) => (
            <Fragment key={prevInvoice.id}>
              <Grid item xs={12}>
                <NameInput
                  formMethods={formMethods}
                  paymentDescriptionError={paymentDescriptionError}
                  disabledValue={
                    prevInvoice.type === InvoiceType.CREDIT_NOTE
                      ? t('Credit Note invoice')
                      : prevInvoice.id !== invoice?.id
                      ? prevInvoice.additionalInfo.payment?.description || '-'
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TableContainer>
                  <Table
                    headStyles={{px: 2}}
                    bodyStyles={{verticalAlign: 'middle', px: 2}}>
                    <TableHead>
                      <TableRow>
                        {perItemSectionColumns.map((column) => (
                          <TableCell
                            key={column.name}
                            align={column.align || 'left'}>
                            {T(column.name)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prevInvoice.items
                        .filter((item) => {
                          const isEditingCurrentItem =
                            prevInvoice.id === invoice?.id;

                          return isEditingCurrentItem
                            ? getItemOverallPercentage(item) -
                                (item.additionalInfo?.payment?.percentage ??
                                  0) <
                                100
                            : (item.additionalInfo?.payment?.percentage ?? 0) >
                                0;
                        })
                        ?.map((item, index) => {
                          const itemIndex = prevInvoice.items.findIndex(
                            (i) => i.id === item.id,
                          );
                          const isEditingCurrentItem =
                            prevInvoice.id === invoice?.id;
                          const currentItem = watchedItems?.[itemIndex];

                          const currentDiscount = currentItem?.discount;
                          const itemDiscount = item?.additionalInfo?.discount;

                          // Calculate base amount before discounts
                          const baseAmount = isEditingCurrentItem
                            ? centsToMoney(
                                item.unitAmount.currency,
                                (currentItem?.unitAmount?.netAmount ?? 0) *
                                  item.quantity,
                              )
                            : (item.unitAmount.netAmount ?? 0) * item.quantity;

                          // Get discount parameters based on whether editing current item
                          const discountParams = isEditingCurrentItem
                            ? currentDiscount?.type === DiscountType.AMOUNT
                              ? {amount: currentDiscount?.amount?.value ?? 0}
                              : {percentage: currentDiscount?.percentage ?? 0}
                            : itemDiscount?.type === DiscountType.AMOUNT
                            ? {amount: itemDiscount?.amount?.value ?? 0}
                            : {percentage: itemDiscount?.percentage ?? 0};

                          // Apply discount to base amount
                          const discountedAmount = applyDiscount({
                            actualValue: baseAmount,
                            ...discountParams,
                          });

                          // Convert to currency if not editing current item
                          const itemTotalPriceExclVat = isEditingCurrentItem
                            ? discountedAmount
                            : centsToMoney(
                                currentCurrency?.code!,
                                discountedAmount,
                              );

                          const itemCurrencySymbol =
                            getCurrencySymbol[item.unitAmount.currency];

                          const paymentPercentage = isEditingCurrentItem
                            ? watchedItems[itemIndex]?.payment?.percentage ??
                              item.additionalInfo?.payment?.percentage ??
                              0
                            : item.additionalInfo?.payment?.percentage ?? 0;

                          const itemAmountToBePaid =
                            (itemTotalPriceExclVat / 100) * paymentPercentage;

                          return (
                            <TableRow key={item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell sx={{width: '45%'}}>
                                <FormInput
                                  fieldProps={{
                                    value: stripHtmlTags(item.name || ''),
                                    disabled: true,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <FormInput
                                  inputType="currency"
                                  fieldProps={{
                                    value: itemTotalPriceExclVat,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          {itemCurrencySymbol}
                                        </InputAdornment>
                                      ),
                                      inputProps: {
                                        style: {textAlign: 'right'},
                                      },
                                    },
                                  }}
                                  numericFormatProps={{disabled: true}}
                                />
                              </TableCell>
                              <TableCell>
                                <FormInput
                                  inputType="currency"
                                  onValueChange={({value}) => {
                                    setValue(`items.${itemIndex}.payment`, {
                                      type: InvoiceItemPaymentType.PERCENTAGE,
                                      percentage: value || 0,
                                    });
                                    onRecalcInvoice();
                                  }}
                                  fieldProps={{
                                    value:
                                      item.additionalInfo?.payment
                                        ?.percentage ?? 0,
                                    InputProps: {
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          %
                                        </InputAdornment>
                                      ),
                                      inputProps: {
                                        style: {textAlign: 'right'},
                                      },
                                    },
                                  }}
                                  numericFormatProps={{
                                    allowLeadingZeros: false,
                                    decimalScale: 0,
                                    isAllowed: (values) =>
                                      isAllowedPortionField(values, item),
                                    disabled: prevInvoice.id !== invoice?.id,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <FormInput
                                  inputType="currency"
                                  fieldProps={{
                                    value: itemAmountToBePaid,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          {itemCurrencySymbol}
                                        </InputAdornment>
                                      ),
                                      inputProps: {
                                        style: {textAlign: 'right'},
                                      },
                                    },
                                  }}
                                  numericFormatProps={{disabled: true}}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              {idx <= previousInvoices?.length - 1 && (
                <Grid item xs={12}>
                  <Divider sx={{borderColor: theme.palette.grey[300]}} />
                </Grid>
              )}
            </Fragment>
          ))}

        {!isEditing && (
          <>
            <Grid item xs={12}>
              <NameInput
                formMethods={formMethods}
                paymentDescriptionError={paymentDescriptionError}
              />
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table
                  headStyles={{px: 2}}
                  bodyStyles={{verticalAlign: 'middle', px: 2}}>
                  <TableHead>
                    <TableRow>
                      {perItemSectionColumns.map((column) => (
                        <TableCell
                          key={column.name}
                          align={column.align || 'left'}>
                          {T(column.name)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {watchedItems
                      ?.filter(
                        // if item already paid 100% full, don't render it
                        (i) => getItemOverallPercentage(i) < 100,
                      )
                      ?.map((item, index) => {
                        // Calculate base amount before discounts
                        const baseAmount = centsToMoney(
                          item.unitAmount.currency,
                          (item.unitAmount.netAmount ?? 0) * item.quantity,
                        );

                        // Apply discount based on discount type (amount or percentage)
                        const discountParams =
                          item?.discount?.type === DiscountType.AMOUNT
                            ? {amount: item?.discount?.amount?.value ?? 0}
                            : {percentage: item?.discount?.percentage ?? 0};

                        const itemTotalPriceExclVat = applyDiscount({
                          actualValue: baseAmount,
                          ...discountParams,
                        });

                        const itemCurrencySymbol =
                          getCurrencySymbol[item.unitAmount.currency];

                        const itemAmountToBePaid =
                          (itemTotalPriceExclVat / 100) *
                          (item.payment?.percentage ?? 0);

                        return (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell sx={{width: '45%'}}>
                              <FormInput
                                fieldProps={{
                                  value: item.name,
                                  disabled: true,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormInput
                                inputType="currency"
                                fieldProps={{
                                  value: itemTotalPriceExclVat,
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        {itemCurrencySymbol}
                                      </InputAdornment>
                                    ),
                                    inputProps: {
                                      style: {textAlign: 'right'},
                                    },
                                  },
                                }}
                                numericFormatProps={{disabled: true}}
                              />
                            </TableCell>
                            <TableCell>
                              <FormInput
                                inputType="currency"
                                onValueChange={({value}) => {
                                  const itemIndex = watchedItems.indexOf(item);
                                  setValue(`items.${itemIndex}.payment`, {
                                    type: InvoiceItemPaymentType.PERCENTAGE,
                                    percentage: value || 0,
                                  });
                                  onRecalcInvoice();
                                }}
                                fieldProps={{
                                  value: item.payment?.percentage ?? 0,
                                  InputProps: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        %
                                      </InputAdornment>
                                    ),
                                    inputProps: {
                                      style: {textAlign: 'right'},
                                    },
                                  },
                                }}
                                numericFormatProps={{
                                  allowLeadingZeros: false,
                                  decimalScale: 0,
                                  isAllowed: (values) =>
                                    isAllowedPortionField(values, item),
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormInput
                                inputType="currency"
                                fieldProps={{
                                  value: itemAmountToBePaid,
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        {itemCurrencySymbol}
                                      </InputAdornment>
                                    ),
                                    inputProps: {
                                      style: {textAlign: 'right'},
                                    },
                                  },
                                }}
                                numericFormatProps={{disabled: true}}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        )}
      </Grid>
    );
  };

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
      <Box>
        <Typography variant="h6" color="primary.dark">
          {T('Invoiced')}
        </Typography>

        <InvoiceShowOnPDFSwitch
          shouldShow={watchedShowInvoicedSection || false}
          onToggle={onInvoicedSectionToggle}
          enableCollapse
        />
      </Box>

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
              if (isEditing && index === previousInvoices?.length - 1) {
                return null;
              }
              const invoiceTotalAmount = i.totalAmount;
              const sortedVats = (invoiceTotalAmount.vats || [])
                .slice()
                .sort((a, b) => a.percentageVat - b.percentageVat);
              const description =
                i.type === InvoiceType.CREDIT_NOTE
                  ? t('Credit Note invoice')
                  : i.additionalInfo?.payment?.description || '';
              const fractionDigits = invoiceTotalAmount?.fractionDigits ?? 2;
              const amountExclVat = Math.abs(
                centsToMoney(
                  currentCurrency.code,
                  invoiceTotalAmount?.netAmount ?? 0,
                ),
              );
              const amountExclVatFormatted = formatCurrency(amountExclVat, {
                currency: currentCurrency.code,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
              });
              const totalAmountInclVat = Math.abs(
                centsToMoney(
                  currentCurrency.code,
                  invoiceTotalAmount?.grossAmount ?? 0,
                ),
              );
              const totalAmountInclVatFormatted = formatCurrency(
                totalAmountInclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: fractionDigits,
                  maximumFractionDigits: fractionDigits,
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
                    {sortedVats?.map((v, idx) => (
                      <p key={idx}>{v.percentageVat}%</p>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    {sortedVats?.map((v, idx) => {
                      const vatAmount = Math.abs(
                        centsToMoney(currentCurrency.code, v?.vat ?? 0),
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
                {currentPercentageVats?.map((v, idx) => (
                  <p key={idx}>{v.percentageVat}%</p>
                ))}
              </TableCell>
              <TableCell align="right" sx={{typography: 'h6', fontWeight: 600}}>
                {currentPercentageVats?.map((v, idx) => {
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
                  currentInvoiceNet +
                    currentPercentageVats
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
            acc + centsToMoney(currentCurrency.code, p.amount?.value ?? 0),
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
  });

  const renderPaymentHistorySection = () => (
    <>
      <Box>
        <Typography variant="h6" color="primary.dark">
          {T('Payment history')}
        </Typography>

        <InvoiceShowOnPDFSwitch
          shouldShow={watchedShowPaymentSection || false}
          onToggle={onPaymentSectionToggle}
          enableCollapse
        />
      </Box>

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
                  ?.map((p) =>
                    centsToMoney(
                      currentCurrency?.code,
                      p.additionalInfo.paymentDetails?.netAmount ?? 0,
                    ),
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
                  ?.map((p) =>
                    centsToMoney(currentCurrency?.code, p.amount?.value ?? 0),
                  )
                  .reduce((a, b) => a + b, 0),
              );

              const totalPriceInclVatFormatted = formatCurrency(
                totalPriceInclVat,
                {
                  currency: currentCurrency.code,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
                        {formatCurrency(
                          Math.abs(
                            centsToMoney(currentCurrency?.code, pV?.vat ?? 0),
                          ),
                          {
                            currency: currentCurrency.code,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
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
        i.payments.filter((payment) => payment.meta.state === State.ACTIVE),
      )
      .flat().length > 0;

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
        {watchedPayment?.type === PaymentType.PER_ITEM ? (
          renderPerItemSection()
        ) : (
          <Grid container rowGap={2.5} justifyContent="space-between">
            {hasPreviousInvoices &&
              previousInvoices?.map((prevInvoice) => (
                <Fragment key={prevInvoice.id}>
                  <Grid item xs={7}>
                    <NameInput
                      formMethods={formMethods}
                      paymentDescriptionError={paymentDescriptionError}
                      disabledValue={
                        prevInvoice.type === InvoiceType.CREDIT_NOTE
                          ? t('Credit Note invoice')
                          : prevInvoice.id !== invoice?.id
                          ? prevInvoice.additionalInfo.payment?.description ||
                            '-'
                          : ''
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    display="flex"
                    justifyContent="flex-end"
                    gap={2}>
                    {watchedPayment?.type === PaymentType.PERCENTAGE && (
                      <NumericFormat
                        {...(prevInvoice.id === invoice?.id
                          ? {
                              value: watchedPayment?.percentage,
                              isAllowed: isAllowedPercentageField,
                              onValueChange: handlePartialPaymentChange,
                            }
                          : {
                              value:
                                prevInvoice.additionalInfo.payment
                                  ?.percentage ?? 0,
                              disabled: true,
                            })}
                        customInput={TextField}
                        label={t('Percentage')}
                        allowLeadingZeros={false}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                          inputProps: {
                            style: {textAlign: 'right'},
                          },
                        }}
                      />
                    )}
                    <NumericFormat
                      {...(prevInvoice.id === invoice?.id
                        ? {
                            value: currentInvoiceNet,
                            isAllowed: isAllowedAmountField,
                            ...(watchedPayment?.type === PaymentType.LUMP_SUM
                              ? {
                                  onValueChange: handlePartialPaymentChange,
                                }
                              : {}),
                            disabled:
                              watchedPayment?.type === PaymentType.PERCENTAGE,
                          }
                        : {
                            value: centsToMoney(
                              currentCurrency?.code,
                              prevInvoice.totalAmount?.netAmount ?? 0,
                            ),
                            disabled: true,
                          })}
                      customInput={TextField}
                      label={t('Amount (excl. VAT)')}
                      allowLeadingZeros={false}
                      decimalScale={2}
                      decimalSeparator={getDecimalSeparator(selectedLng)}
                      thousandSeparator={getThousandsSeparator(selectedLng)}
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
                      id="partial-amount"
                    />
                  </Grid>
                </Fragment>
              ))}
            {!isEditing && (
              <>
                <Grid item xs={7}>
                  <NameInput
                    formMethods={formMethods}
                    paymentDescriptionError={paymentDescriptionError}
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  display="flex"
                  justifyContent="flex-end"
                  gap={2}>
                  {watchedPayment?.type === PaymentType.PERCENTAGE && (
                    <NumericFormat
                      name="payment.percentage"
                      value={watchedPayment?.percentage}
                      isAllowed={isAllowedPercentageField}
                      customInput={TextField}
                      label={t('Percentage')}
                      allowLeadingZeros={false}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                        inputProps: {
                          style: {textAlign: 'right'},
                        },
                      }}
                      onValueChange={handlePartialPaymentChange}
                    />
                  )}
                  <NumericFormat
                    name="payment.amount.value"
                    value={
                      watchedPayment?.type === PaymentType.PERCENTAGE
                        ? currentInvoiceNet
                        : paymentValue
                    }
                    disabled={watchedPayment?.type === PaymentType.PERCENTAGE}
                    isAllowed={isAllowedAmountField}
                    customInput={TextField}
                    label={t('Amount (excl. VAT)')}
                    allowLeadingZeros={false}
                    decimalScale={2}
                    decimalSeparator={getDecimalSeparator(selectedLng)}
                    thousandSeparator={getThousandsSeparator(selectedLng)}
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
                    {...(watchedPayment?.type === PaymentType.LUMP_SUM
                      ? {
                          onValueChange: handlePartialPaymentChange,
                        }
                      : {})}
                    id="partial-amount"
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}

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

          {finalAggregatedVats?.map((v) => (
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
            {!isEditing || (isEditing && previousInvoices?.length > 1) ? (
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
