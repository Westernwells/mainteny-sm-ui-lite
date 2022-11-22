import React, {FC} from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {ContractUpdateRequest} from 'models/contract';
import {FormikProps} from 'formik';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {convertToText} from 'utils/utils';
import {InvoiceDueType} from 'models/invoice';
import {FormSelect} from 'components/form/FormSelect';
import {getCurrencySymbol} from 'utils/currency';

interface Props {
  formik: FormikProps<ContractUpdateRequest>;
  currency: string;
}

const EditContractForm: FC<Props> = ({formik, currency}) => {
  const {user} = useUserSession();
  return (
    <Grid container spacing={2} sx={{mt: '0.5em'}}>
      <Grid item md={6}>
        <FormSelect
          labelId="typeSelect-label"
          label="Contract Type"
          options={(
            user?.userAccount?.serviceCompany?.settings?.contractTypes ?? []
          ).map((item) => ({
            label: convertToText(item),
            value: convertToText(item),
          }))}
          selectProps={{
            id: 'typeSelect',
            value: convertToText(formik.values.type || ''),
            onChange: formik.handleChange,
            error: !!(formik.touched.type && formik.errors.type),
            placeholder: 'Select Contract type',
            name: 'type',
          }}
          required
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter number of visits',
            label: 'Number of Visits',
            name: 'visitsNumber',
            type: 'number',
            value: Number(formik.values.visitsNumber).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter price/year',
            label: 'Price/Year (excl. VAT, in €)',
            name: 'price',
            type: 'number',
            value: Number(formik.values.price).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start" color="text.primary">
                  €
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter spending limit (in €)',
            label: 'Spending Limit (in €)',
            name: 'spendingLimit',
            value: Number(formik.values.spendingLimit).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start" color="text.primary">
                  €
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter renewal period (in months)',
            label: 'Renewal Period (in months)',
            name: 'renewalTerms',
            type: 'number',
            value: Number(formik.values.renewalTerms).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!(
              formik.touched.renewalTerms && formik.errors.renewalTerms
            ),
            inputProps: {
              min: 0,
              max: 12,
            },
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormSelect
          labelId="invoiceDueSelect-label"
          label="Invoice Due"
          options={Object.keys(InvoiceDueType).map((item) => ({
            label: convertToText(item),
            value: convertToText(item),
          }))}
          selectProps={{
            id: 'invoiceDueSelect',
            value: convertToText(formik.values.invoiceDue || ''),
            onChange: formik.handleChange,
            error: !!(formik.touched.invoiceDue && formik.errors.invoiceDue),
            name: 'invoiceDue',
          }}
          required
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter payment due (in days)',
            label: 'Payment Due (in days)',
            name: 'invoiceDueDays',
            type: 'number',
            value: Number(formik.values.invoiceDueDays).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!(
              formik.touched.invoiceDueDays && formik.errors.invoiceDueDays
            ),
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter yearly price adjustment',
            label: 'Yearly Price Adjustment (%)',
            name: 'annualPriceAdjustmentPercentage',
            type: 'number',
            value: Number(
              formik.values.annualPriceAdjustmentPercentage,
            ).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!(
              formik.touched.annualPriceAdjustmentPercentage &&
              formik.errors.annualPriceAdjustmentPercentage
            ),
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter discount',
            label: 'Discount (first 14 days)',
            name: 'discounts',
            type: 'number',
            value: Number(formik.values.discounts).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!(formik.touched.discounts && formik.errors.discounts),
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

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter notice period',
            label: 'Notice Period (in months)',
            name: 'noticePeriodInMonth',
            type: 'number',
            value: Number(formik.values.noticePeriodInMonth).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!(
              formik.touched.noticePeriodInMonth &&
              formik.errors.noticePeriodInMonth
            ),
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Enter hourly rates',
            label: 'Hourly rate',
            name: 'hourlyRate',
            type: 'number',
            value: Number(formik.values.hourlyRate).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!(formik.touched.hourlyRate && formik.errors.hourlyRate),
            InputProps: {
              startAdornment: (
                <InputAdornment position="start" color="text.primary">
                  {getCurrencySymbol[currency]}
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default EditContractForm;
