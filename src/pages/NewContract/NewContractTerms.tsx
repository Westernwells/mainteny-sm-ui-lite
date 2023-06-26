import {useTranslation} from 'react-i18next';
import {Grid, InputAdornment} from '@mui/material';
import {ArrowDropDown} from '@mui/icons-material';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {ContractTermsFormModal} from 'models/contract';
import {FC, useState} from 'react';
import {useCurrentCurrency} from 'utils/currency';
import {invoiceCycle} from 'utils/contract-utils';
import {DatePicker} from 'components/DatePicker';
import {format, getMonth, getYear} from 'date-fns';
import {ContractPaymentTermsDialog} from 'components/ContractPaymentTermsDialog';

interface Props {
  formik: FormikProps<ContractTermsFormModal>;
}

const NewContractTerms: FC<Props> = ({formik}) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [openContractPaymentTermsDialog, setOpenContractPaymentTermsDialog] =
    useState(false);

  const handleContractPaymentTermsModal = (paymentTerms: string) => {
    formik.setFieldValue('paymentTerms', paymentTerms);
    setOpenContractPaymentTermsDialog(false);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Visits per Year',
            name: 'visitsNumber',
            placeholder: '4',
            type: 'number',
            required: true,
            value: Number(formik.values.visitsNumber).toString(),
            error: !!(
              formik.touched.visitsNumber && formik.errors.visitsNumber
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item xs={4}>
        <FormSelect
          labelId="invoiceDueSelect-label"
          label="Invoice Cycle"
          options={Object.keys(invoiceCycle).map((key) => ({
            label: invoiceCycle[key],
            value: key,
          }))}
          selectProps={{
            id: 'invoiceDueSelect',
            value: formik.values.invoiceCycle,
            onChange: formik.handleChange,
            error: !!(
              formik.touched.invoiceCycle && formik.errors.invoiceCycle
            ),
            name: 'invoiceCycle',
            placeholder: 'Yearly',
          }}
          required
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: t(
              'Yearly Contract Price (excl. VAT, in {{currencySymbol}})',
              {
                currencySymbol: currentCurrency.symbol,
              },
            ),
            name: 'netAmount',
            placeholder: '1500',
            type: 'number',
            required: true,
            value: Number(formik.values.netAmount).toString(),
            error: !!(formik.touched.netAmount && formik.errors.netAmount),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {currentCurrency.symbol}
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Contract Renewal Period (in months)',
            name: 'renewalTerms',
            placeholder: '12',
            type: 'number',
            value: Number(formik.values.renewalTerms).toString(),
            error: !!(
              formik.touched.renewalTerms && formik.errors.renewalTerms
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: t('Spending Allowance (in {{currencySymbol}})', {
              currencySymbol: currentCurrency.symbol,
            }),
            name: 'spendingLimit',
            placeholder: '1500',
            type: 'number',
            value: Number(formik.values.spendingLimit).toString(),
            error: !!(
              formik.touched.spendingLimit && formik.errors.spendingLimit
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {currentCurrency.symbol}
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: t('Defined Hourly Rate (in {{currencySymbol}})', {
              currencySymbol: currentCurrency.symbol,
            }),
            name: 'hourlyRate',
            placeholder: '60',
            type: 'number',
            value: Number(formik.values.hourlyRate).toString(),
            error: !!(formik.touched.hourlyRate && formik.errors.hourlyRate),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {currentCurrency.symbol}
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Payment Due (in days)',
            name: 'invoiceDueDays',
            placeholder: 'Enter payment due (in days)',
            type: 'number',
            value: formik.values.invoiceDueDays,
            error: !!(
              formik.touched.invoiceDueDays && formik.errors.invoiceDueDays
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Discount (first 14 days)',
            name: 'discounts[0].days',
            placeholder: 'Enter payment due (in days)',
            type: 'number',
            value: formik.values.discounts?.[0]?.days ?? 0,
            error: !!(formik.touched.discounts && formik.errors.discounts),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              endAdornment: (
                <InputAdornment position="end" color="text.primary">
                  %
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Notice Period (in months)',
            name: 'noticePeriodInMonth',
            placeholder: 'Enter notice period',
            type: 'number',
            value: formik.values.noticePeriodInMonth,
            error: !!(
              formik.touched.noticePeriodInMonth &&
              formik.errors.noticePeriodInMonth
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Yearly Price Adjustment (in %)',
            name: 'annualPriceAdjustmentPercentage',
            placeholder: '2.5',
            type: 'number',
            value: Number(
              formik.values.annualPriceAdjustmentPercentage,
            ).toString(),
            error: !!(
              formik.touched.annualPriceAdjustmentPercentage &&
              formik.errors.annualPriceAdjustmentPercentage
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <FormInput
          props={{
            label: 'Service Level Agreement (in min)',
            name: 'serviceLevelAgreement',
            placeholder: '120',
            type: 'number',
            value: Number(formik.values.serviceLevelAgreement).toString(),
            error: !!(
              formik.touched.serviceLevelAgreement &&
              formik.errors.serviceLevelAgreement
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={4}>
        <DatePicker
          dateFormat="MMM yyyy"
          disableMask
          containerStyles={{mr: '1em', width: '100%'}}
          getSelectedDate={(date) => {
            if (date) {
              formik.setValues({
                ...formik.values,
                firstMaintenance: {
                  year: getYear(date),
                  month: getMonth(date),
                },
              });
            }
          }}
          textFieldProps={{
            label: t('First Maintenance Visit'),
            name: 'firstMaintenance',
            helperText:
              formik.errors.firstMaintenance && formik.touched.firstMaintenance
                ? formik.errors.firstMaintenance
                : '',
            error: !!(
              formik.touched.firstMaintenance && formik.errors.firstMaintenance
            ),
            sx: {width: '100%'},
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item md={4}>
        <DatePicker
          containerStyles={{mr: '1em', width: '100%'}}
          getSelectedDate={(date) => {
            if (date) {
              formik.setValues({
                ...formik.values,
                firstInvoiceDate: format(date, 'yyyy-MM-dd'),
              });
            }
          }}
          disableMask
          textFieldProps={{
            label: t('First Invoice'),
            name: 'firstInvoiceDate',
            helperText:
              formik.errors.firstInvoiceDate && formik.touched.firstInvoiceDate
                ? formik.errors.firstInvoiceDate
                : '',
            error: !!(
              formik.touched.firstInvoiceDate && formik.errors.firstInvoiceDate
            ),
            sx: {width: '100%'},
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item md={4}>
        <FormInput
          props={{
            label: 'Payment terms',
            name: 'paymentTerms',
            placeholder: 'Choose your payment term',
            value: formik.values.paymentTerms ? t('Choosed') : '',
            error: !!(
              formik.touched.paymentTerms && formik.errors.paymentTerms
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            onClick: () => setOpenContractPaymentTermsDialog(true),
            disabled: true,
            InputProps: {
              endAdornment: (
                <InputAdornment position="end" color="text.primary">
                  <ArrowDropDown />
                </InputAdornment>
              ),
            },
            inputProps: {
              sx: {
                cursor: 'pointer',
                '&::placeholder': {
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Grid>

      <ContractPaymentTermsDialog
        title={t('Choose your payment term')}
        open={openContractPaymentTermsDialog}
        onSave={handleContractPaymentTermsModal}
        onCancel={() => handleContractPaymentTermsModal('')}
        paymentTerms={formik.values.paymentTerms}
      />
    </Grid>
  );
};

export default NewContractTerms;
