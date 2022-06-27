import {Grid} from '@mui/material';
import {CustomerAutoComplete} from 'components/CustomerAutocomplete';
import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {ContractBasicInfoFormModel, ContractType} from 'models/contract';
import React, {FC} from 'react';
import {convertToText} from 'utils/utils';

interface Props {
  formik: FormikProps<ContractBasicInfoFormModel>;
}

const NewContractBasicInfo: FC<Props> = ({formik}) => (
  <Grid container spacing={2}>
    <Grid item xs={4}>
      <CustomerAutoComplete
        getCustomer={(customer) =>
          formik.setFieldValue('propertyOwner', customer)
        }
        textFieldProps={{
          label: 'Customer',
        }}
        initialValue={formik.values.propertyOwner}
      />
    </Grid>
    <Grid item xs={4}>
      <DatePicker
        getSelectedDate={(val) => formik.setFieldValue('startDate', val)}
        textFieldProps={{
          name: 'startDate',
          label: 'Start Date',
          onChange: formik.handleChange,
          required: true,
          helperText:
            formik.errors.startDate && formik.touched.startDate
              ? formik.errors.startDate
              : '',
          error: !!(formik.touched.startDate && formik.errors.startDate),
        }}
        defaultDate={new Date(formik.values.startDate || Date.now())}
      />
    </Grid>
    <Grid item xs={4}>
      <DatePicker
        getSelectedDate={(val) => formik.setFieldValue('endDate', val)}
        textFieldProps={{
          name: 'endDate',
          label: 'End Date',
          onChange: formik.handleChange,
          required: true,
          helperText:
            formik.errors.endDate && formik.touched.endDate
              ? formik.errors.endDate
              : '',
          error: !!(formik.touched.endDate && formik.errors.endDate),
        }}
        defaultDate={new Date(formik.values.endDate || Date.now())}
      />
    </Grid>
    <Grid item xs={4}>
      <FormSelect
        labelId="contractTypeSelect-label"
        label="Contract Type"
        options={Object.keys(ContractType).map((key) => ({
          label: convertToText(key),
          value: convertToText(key),
        }))}
        selectProps={{
          id: 'contractTypeSelect',
          value: formik.values.contractType,
          onChange: formik.handleChange,
          name: 'contractType',
        }}
        required
      />
    </Grid>
    <Grid item xs={4}>
      <FormInput
        props={{
          label: 'Contract Number',
          name: 'externalId',
          placeholder: '454846',
          type: 'text',
          required: true,
          value: formik.values.externalId,
          error: !!(formik.touched.externalId && formik.errors.externalId),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
    </Grid>
  </Grid>
);

export default NewContractBasicInfo;
