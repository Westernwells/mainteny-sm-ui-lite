import {useTranslation} from 'react-i18next';
import {Grid, InputAdornment} from '@mui/material';
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
import {useQueryContractPaymentTerms} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging-utils';

interface Props {
  formik: FormikProps<ContractTermsFormModal>;
}

const pageSize = 50;

const NewContractTerms: FC<Props> = ({formik}) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [openContractPaymentTermsDialog, setOpenContractPaymentTermsDialog] =
    useState(false);

  const {data: contractPaymentTerms = createEmptyResource(pageSize)} =
    useQueryContractPaymentTerms({
      page: {
        pageIndex: 0,
        pageSize,
      },
      query: '',
    });

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
            helperText:
              formik.errors.visitsNumber && formik.touched.visitsNumber
                ? formik.errors.visitsNumber
                : '',
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item xs={4}>
        <FormSelect
          labelId="invoiceDueSelect-label"
          label="Select Invoice Cycle"
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
            helperText:
              formik.errors.netAmount && formik.touched.netAmount
                ? formik.errors.netAmount
                : '',
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
            helperText:
              formik.errors.renewalTerms && formik.touched.renewalTerms
                ? formik.errors.renewalTerms
                : '',
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
            helperText:
              formik.errors.spendingLimit && formik.touched.spendingLimit
                ? formik.errors.spendingLimit
                : '',
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
            label: 'Payment Due (in days)',
            name: 'invoiceDueDays',
            placeholder: 'Enter payment due (in days)',
            type: 'number',
            value: formik.values.invoiceDueDays,
            helperText:
              formik.errors.invoiceDueDays && formik.touched.invoiceDueDays
                ? formik.errors.invoiceDueDays
                : '',
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
            helperText:
              formik.errors.discounts && formik.touched.discounts
                ? formik.errors.discounts
                : '',
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
            helperText:
              formik.errors.noticePeriodInMonth &&
              formik.touched.noticePeriodInMonth
                ? formik.errors.noticePeriodInMonth
                : '',
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
            helperText:
              formik.errors.annualPriceAdjustmentPercentage &&
              formik.touched.annualPriceAdjustmentPercentage
                ? formik.errors.annualPriceAdjustmentPercentage
                : '',
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
            helperText:
              formik.errors.serviceLevelAgreement &&
              formik.touched.serviceLevelAgreement
                ? formik.errors.serviceLevelAgreement
                : '',
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
        {contractPaymentTerms?.data && (
          <FormSelect
            labelId="Payment Terms"
            label={t('Select or Add Payment Terms')}
            options={contractPaymentTerms?.data?.map(({term}) => ({
              label: term,
              value: term,
            }))}
            selectProps={{
              id: 'paymentTerms',
              value: formik.values.paymentTerms
                ? formik.values.paymentTerms
                : undefined,
              onChange: formik.handleChange,
              name: 'paymentTerms',
              error: !!(
                formik.touched.paymentTerms && formik.errors.paymentTerms
              ),
            }}
            onClickPaymentTerms={() => setOpenContractPaymentTermsDialog(true)}
          />
        )}
      </Grid>

      <ContractPaymentTermsDialog
        title={t('Manage Payment Terms')}
        alertText={t(
          'Add your payment terms that would be used later in invoicing',
        )}
        open={openContractPaymentTermsDialog}
        onCancel={() => setOpenContractPaymentTermsDialog(false)}
      />
    </Grid>
  );
};

export default NewContractTerms;
