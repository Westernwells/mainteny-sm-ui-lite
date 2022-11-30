import {useTranslation} from 'react-i18next';
import {Grid, InputAdornment} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {ContractTermsFormModal} from 'models/contract';
import {InvoiceDueType} from 'models/invoice';
import React, {FC} from 'react';
import {useCurrentCurrency} from 'utils/currency';
import {convertToText} from 'utils/utils';

interface Props {
  formik: FormikProps<ContractTermsFormModal>;
}

const NewContractTerms: FC<Props> = ({formik}) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
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
          label="Invoice Due"
          options={Object.keys(InvoiceDueType).map((item) => ({
            label: convertToText(item),
            value: convertToText(item),
          }))}
          selectProps={{
            id: 'invoiceDueSelect',
            value: formik.values.invoiceDue,
            onChange: formik.handleChange,
            error: !!(formik.touched.invoiceDue && formik.errors.invoiceDue),
            name: 'invoiceDue',
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
    </Grid>
  );
};

export default NewContractTerms;
