import React, {FC} from 'react';
import {Box, InputAdornment} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {ContractRequestBody, ContractType} from 'models/contract';
import {FormikProps} from 'formik';
import {convertToText} from 'utils/utils';
import {InvoiceDueType} from 'models/invoice';
import {FormSelect} from 'components/form/FormSelect';

interface Props {
  formik: FormikProps<ContractRequestBody>;
}

const EditContractForm: FC<Props> = ({formik}) => (
  <Box
    sx={{
      '& > div': {
        marginY: '10px',
      },
    }}>
    {console.log(formik.values, '<<< formik')}
    <FormSelect
      labelId="typeSelect-label"
      label="Contract Type"
      options={Object.keys(ContractType).map((item) => ({
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
    <FormInput
      props={{
        placeholder: 'Enter price/year',
        label: 'Price/Year (excl. VAT, in €)*',
        name: 'price',
        type: 'number',
        value: Number(formik.values.price).toString(),
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        InputProps: {
          startAdornment: (
            <InputAdornment position="start" color="#222B45">
              €
            </InputAdornment>
          ),
        },
      }}
    />
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
            <InputAdornment position="start" color="#222B45">
              €
            </InputAdornment>
          ),
        },
      }}
    />
    <FormInput
      props={{
        placeholder: 'Enter renewal period (in months)',
        label: 'Renewal Period (in months)',
        name: 'renewalTerms',
        type: 'number',
        value: Number(formik.values.renewalTerms).toString(),
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
        error: !!(formik.touched.renewalTerms && formik.errors.renewalTerms),
        inputProps: {
          min: 0,
          max: 12,
        },
      }}
    />
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
  </Box>
);

export default EditContractForm;
