import {Grid} from '@mui/material';
import {CustomerAutoComplete} from 'components/CustomerAutocomplete';
import {DatePicker} from 'components/DatePicker';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ContractBasicInfoFormModel} from 'models/contract';
import {PropertyOwnerView} from 'models/propertyManager';
import React, {FC, useEffect, useState} from 'react';
import {convertToText} from 'utils/utils';

interface Props {
  formik: FormikProps<ContractBasicInfoFormModel>;
  getCustomer?: (customer?: PropertyOwnerView) => void;
  initialCustomer?: PropertyOwnerView;
}

const NewContractBasicInfo: FC<Props> = ({
  formik,
  getCustomer,
  initialCustomer,
}) => {
  const {user} = useUserSession();
  const [customer, setCustomer] = useState(initialCustomer);

  useEffect(() => {
    if (getCustomer) {
      getCustomer(customer);
    }
  }, [customer]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <CustomerAutoComplete
          getCustomer={(value) => {
            formik.setValues({
              ...formik.values,
              propertyOwnerId: value ? value.id : '',
            });
            if (value) {
              setCustomer(value);
            }
          }}
          initialValue={initialCustomer || null}
          textFieldProps={{
            error: !!(
              formik.errors.propertyOwnerId && formik.touched.propertyOwnerId
            ),
            helperText:
              formik.errors.propertyOwnerId && formik.touched.propertyOwnerId
                ? formik.errors.propertyOwnerId
                : '',
            label: 'Customer',
            name: 'propertyOwnerId',
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <DatePicker
          getSelectedDate={(val) => formik.setFieldValue('startDate', val)}
          textFieldProps={{
            name: 'startDate',
            id: 'startDate',
            label: 'Start Date',
            onChange: formik.handleChange,
            required: true,
            helperText:
              formik.errors.startDate && formik.touched.startDate
                ? formik.errors.startDate
                : '',
            error: !!(formik.touched.startDate && formik.errors.startDate),
            onBlur: formik.handleBlur,
          }}
          defaultDate={formik.values.startDate}
          maxDate={formik.values.endDate!}
        />
      </Grid>
      <Grid item xs={4}>
        <DatePicker
          getSelectedDate={(val) => formik.setFieldValue('endDate', val)}
          textFieldProps={{
            name: 'endDate',
            id: 'endDate',
            label: 'End Date',
            onChange: formik.handleChange,
            required: true,
            helperText:
              formik.errors.endDate && formik.touched.endDate
                ? formik.errors.endDate
                : '',
            error: !!(formik.touched.endDate && formik.errors.endDate),
            onBlur: formik.handleBlur,
          }}
          defaultDate={formik.values.endDate}
          minDate={
            new Date(
              new Date(formik.values.startDate! || Date.now()).getTime() +
                86400000,
            )
          }
        />
      </Grid>
      <Grid item xs={4}>
        <FormSelect
          labelId="contractTypeSelect-label"
          label="Contract Type"
          options={(
            user?.userAccount?.serviceCompany?.settings?.contractTypes ?? []
          ).map((key) => ({
            label: convertToText(key),
            value: key,
          }))}
          selectProps={{
            id: 'contractTypeSelect',
            value: formik.values.contractType,
            onChange: formik.handleChange,
            name: 'contractType',
            onBlur: formik.handleBlur,
          }}
          required
        />
      </Grid>
    </Grid>
  );
};

export default NewContractBasicInfo;
