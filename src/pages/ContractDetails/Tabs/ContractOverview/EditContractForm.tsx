import React, {FC} from 'react';
import {Box, InputAdornment} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {FormikContractView, ContractType} from 'models/contract';
import {FormikProps} from 'formik';
import {ComboBox} from 'components/ComboBox';
import {convertToText} from 'utils/utils';

interface Props {
  formik: FormikProps<FormikContractView>;
}

const EditContractForm: FC<Props> = ({formik}) => (
  <Box>
    <ComboBox
      options={Object.keys(ContractType).map((item) => ({
        label: convertToText(item),
        value: convertToText(item),
      }))}
      initialValue={
        formik.values.type
          ? {
              label: convertToText(formik.values.type),
              value: convertToText(formik.values.type),
            }
          : null
      }
      initialQuery={formik.values.type}
      getValue={(item) => formik.setFieldValue('type', item?.value)}
      textFieldProps={{
        name: 'type',
        label: 'Contract Type',
        onBlur: formik.handleBlur,
        error: !!(formik.touched.type && formik.errors.type),
        helperText: formik.errors.type,
        placeholder: 'Select Contract type',
      }}
    />
    <FormInput
      props={{
        placeholder: 'Enter number of visits',
        label: 'Number of Visits',
        name: 'numberOfVisits',
        value: formik.values.visitsNumber,
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
      }}
    />
    <FormInput
      props={{
        placeholder: 'Enter price/year',
        label: 'Price/Year (excl. VAT, in €)*',
        name: 'price',
        value: formik.values.price,
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
        value: formik.values.spendingLimit,
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
        value: formik.values.renewalTerms,
        onBlur: formik.handleBlur,
        onChange: formik.handleChange,
      }}
    />
    <ComboBox
      options={[]}
      initialValue={
        formik.values.invoiceDue
          ? {
              label: convertToText(formik.values.invoiceDue),
              value: convertToText(formik.values.invoiceDue),
            }
          : null
      }
      initialQuery={formik.values.invoiceDue}
      getValue={(item) => formik.setFieldValue('invoiceDue', item?.value)}
      textFieldProps={{
        name: 'invoiceDue',
        label: 'Invoice Due',
        onBlur: formik.handleBlur,
        error: !!(formik.touched.invoiceDue && formik.errors.invoiceDue),
        helperText: formik.errors.invoiceDue,
        placeholder: 'Select Invoice due',
      }}
    />
  </Box>
);

export default EditContractForm;
