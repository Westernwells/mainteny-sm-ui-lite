import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {ContractUpdateRequest} from 'models/contract';
import {FormikProps} from 'formik';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {FormSelect} from 'components/form/FormSelect';
import {getCurrencySymbol} from 'utils/currency';
import {invoiceCycle} from 'utils/contract-utils';
import {DatePicker} from 'components/DatePicker';
import {format, getMonth, getYear} from 'date-fns';
import {toDate} from 'utils/datetime';

interface Props {
  formik: FormikProps<ContractUpdateRequest>;
  currency: string;
}

const EditContractForm: FC<Props> = ({formik, currency}) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currencySymbol = getCurrencySymbol[currency];
  return (
    <Grid container spacing={2} sx={{mt: '0.5em'}}>
      <Grid item md={6}>
        <FormSelect
          labelId="typeSelect-label"
          label="Contract Name"
          options={(
            user?.userAccount?.serviceCompany?.settings?.contractNameTypes ?? []
          ).map((item) => ({
            label: item.name,
            value: item.name,
          }))}
          selectProps={{
            id: 'typeSelect',
            value: formik.values.name,
            onChange: formik.handleChange,
            error: !!formik.errors.name,
            placeholder: 'Select contract name',
            name: 'name',
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
            placeholder: t('Enter price/year (in {{currencySymbol}})', {
              currencySymbol,
            }),
            label: t(`Price/Year (excl. VAT, in {{currencySymbol}})`, {
              currencySymbol,
            }),
            name: 'price',
            type: 'number',
            value: Number(formik.values.price).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start" color="text.primary">
                  {currencySymbol}
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: t(`Enter spending limit (in {{currencySymbol}})`, {
              currencySymbol,
            }),
            label: t(`Spending Limit (in {{currencySymbol}})`, {
              currencySymbol,
            }),
            name: 'spendingLimit',
            value: Number(formik.values.spendingLimit).toString(),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start" color="text.primary">
                  {currencySymbol}
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
            value: formik.values.renewalTerms,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            error: !!formik.errors.renewalTerms,
            helperText: formik.errors.renewalTerms,
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
          label="Invoice Cycle"
          options={Object.keys(invoiceCycle).map((key) => ({
            label: invoiceCycle[key],
            value: key,
          }))}
          selectProps={{
            id: 'invoiceCycleSelect',
            value: formik.values.invoiceCycle
              ? formik.values.invoiceCycle.toString()
              : '',
            onChange: formik.handleChange,
            error: !!formik.errors.invoiceCycle,
            name: 'invoiceCycle',
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
            error: !!formik.errors.invoiceDueDays,
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
            error: !!formik.errors.annualPriceAdjustmentPercentage,
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
            error: !!formik.errors.discounts,
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
            error: !!formik.errors.noticePeriodInMonth,
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
            error: !!formik.errors.hourlyRate,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start" color="text.primary">
                  {currencySymbol}
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid item md={6}>
        <DatePicker
          defaultDate={
            formik.values.firstMaintenance &&
            new Date(
              formik.values.firstMaintenance?.year,
              formik.values.firstMaintenance?.month,
            )
          }
          dateFormat="MMM yyyy"
          disableMask
          containerStyles={{mr: '1em', width: '100%'}}
          getSelectedDate={(date) => {
            formik.setValues({
              ...formik.values,
              firstMaintenance: {
                year: getYear(date!),
                month: getMonth(date!),
              },
            });
          }}
          textFieldProps={{
            label: t('First maintenance visit'),
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

      <Grid item md={6}>
        <DatePicker
          defaultDate={
            formik.values.firstMaintenance &&
            toDate(formik.values.firstInvoiceDate)
          }
          containerStyles={{mr: '1em', width: '100%'}}
          getSelectedDate={(date) => {
            formik.setValues({
              ...formik.values,
              firstInvoiceDate: format(date!, 'yyyy-MM-dd'),
            });
          }}
          disableMask
          textFieldProps={{
            label: t('First invoice'),
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
    </Grid>
  );
};

export default EditContractForm;
