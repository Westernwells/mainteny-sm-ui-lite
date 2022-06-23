import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikValues, useFormik} from 'formik';
import {UnitDetailsFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect, useState} from 'react';
import {PageCard} from 'components/PageCard';
import {convertToText} from 'utils/utils';
import {ComboBox} from 'components/ComboBox';
import {createEmptyResource} from 'utils/paging-utils';
import {useCacheValues} from 'hooks/reactQuery/useElevator';
import {CacheTypes} from 'models/misc';
import {ElevatorCategory} from 'models/elevator';
import InputAdornment from '@mui/material/InputAdornment';

interface Props {
  getUnitDetailsFormErrors?: (val: FormikErrors<UnitDetailsFormModel>) => void;
  getUnitDetailsFormValues?: (val: FormikValues) => void;
  initialValues?: UnitDetailsFormModel;
}

const validationSchema = Yup.object().shape({
  unitNumber: Yup.string().nullable().required('Unit number is required'),
  category: Yup.string().nullable().required('Category is required'),
  model: Yup.string().nullable().required('Model is required'),
  unitCapacity: Yup.string().nullable().required('Unit capacity is required'),
  unitType: Yup.string().nullable().required('Unit type is required'),
});

export const UnitDetailsForm = ({
  getUnitDetailsFormErrors,
  getUnitDetailsFormValues,
  initialValues,
}: Props) => {
  const [unitTypeQuery, setUnitTypeQuery] = useState('');
  const [modelQuery, setModelQuery] = useState('');
  const formik = useFormik<UnitDetailsFormModel>({
    initialValues: {
      category: initialValues?.category,
      manufacturer: initialValues?.manufacturer,
      unitNumber: initialValues?.unitNumber,
      numberOfStops: initialValues?.numberOfStops,
      cabinType: initialValues?.cabinType,
      emergencyPhoneProvider: initialValues?.emergencyPhoneProvider,
      unitType: initialValues?.unitType,
      model: initialValues?.model,
      serialNumber: initialValues?.serialNumber,
      unitCapacity: initialValues?.unitCapacity,
      spendingLimit: initialValues?.spendingLimit,
      emergencyContractNumber: initialValues?.emergencyContractNumber,
      yearBuilt: initialValues?.yearBuilt,
      modelOfController: initialValues?.modelOfController,
      manufacturerOfController: initialValues?.manufacturerOfController,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const {data: elevatorTypeResource = createEmptyResource<string>()} =
    useCacheValues(
      {
        pageIndex: 0,
        pageSize: 10,
        query: unitTypeQuery,
      },
      CacheTypes.ELEVATOR_TYPE,
    );

  const {data: elevatorModelsResource = createEmptyResource<string>()} =
    useCacheValues(
      {
        pageIndex: 0,
        pageSize: 10,
        query: modelQuery,
      },
      CacheTypes.ELEVATOR_MODEL,
    );

  useEffect(() => {
    if (getUnitDetailsFormErrors) {
      getUnitDetailsFormErrors(formik.errors);
    }

    if (getUnitDetailsFormValues) {
      getUnitDetailsFormValues(formik.values);
    }
  }, [formik]);

  return (
    <PageCard
      headerLabel="Unit Details"
      containerStyles={{flexGrow: 1, overflowY: 'scroll', height: 0}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item md={4}>
            <ComboBox
              options={Object.keys(ElevatorCategory).map((item) => ({
                label: convertToText(item),
                value: convertToText(item),
              }))}
              initialValue={
                formik.values.category
                  ? {
                      label: formik.values.category,
                      value: formik.values.category,
                    }
                  : null
              }
              initialQuery={formik.values.category}
              getValue={(item) => formik.setFieldValue('category', item?.value)}
              textFieldProps={{
                name: 'category',
                label: 'Unit Category',
                onBlur: formik.handleBlur,
                error: !!(formik.touched.category && formik.errors.category),
                helperText:
                  formik.touched.category && formik.errors.category
                    ? formik.errors.category
                    : '',
                placeholder: 'e.g Elevator',
                required: true,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                placeholder: 'e.g. Elevator Installation Meier',
                label: 'Manufacturer',
                name: 'manufacturer',
                value: formik.values.manufacturer,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                placeholder: 'e.g. 000001',
                label: 'Unit Number',
                name: 'unitNumber',
                value: formik.values.unitNumber,
                error: !!(
                  formik.touched.unitNumber && formik.errors.unitNumber
                ),
                helperText:
                  formik.touched.unitNumber && formik.errors.unitNumber
                    ? formik.errors.unitNumber
                    : '',
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                required: true,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. 10',
                label: 'Number of Stops',
                name: 'numberOfStops',
                value: formik.values.numberOfStops,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. 2 doors',
                label: 'Cabin Type',
                name: 'cabinType',
                value: formik.values.cabinType,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g SafeLine',
                label: 'Emergency Phone Provider',
                name: 'emergencyPhoneProvider',
                value: formik.values.emergencyPhoneProvider,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <ComboBox
              options={elevatorTypeResource.data.map((item) => ({
                label: item,
                value: item,
              }))}
              getValue={(item) => formik.setFieldValue('unitType', item?.value)}
              initialValue={
                formik.values.unitType
                  ? {
                      label: formik.values.unitType,
                      value: formik.values.unitType,
                    }
                  : null
              }
              initialQuery={formik.values.unitType}
              getQuery={(item) => setUnitTypeQuery(item || '')}
              textFieldProps={{
                placeholder: 'e.g. Hydraulic',
                name: 'unitType',
                label: 'Unit Type',
                required: true,
                onBlur: formik.handleBlur,
                error: !!(formik.touched.unitType && formik.errors.unitType),
                helperText:
                  formik.touched.unitType && formik.errors.unitType
                    ? formik.errors.unitType
                    : '',
              }}
            />
          </Grid>

          <Grid item md={4}>
            <ComboBox
              options={elevatorModelsResource.data.map((item) => ({
                label: item,
                value: item,
              }))}
              getValue={(item) => formik.setFieldValue('model', item?.value)}
              initialValue={
                formik.values.model
                  ? {
                      label: formik.values.model,
                      value: formik.values.model,
                    }
                  : null
              }
              initialQuery={formik.values.model}
              getQuery={(item) => setModelQuery(item || '')}
              textFieldProps={{
                name: 'model',
                label: 'Model',
                placeholder: 'e.g. S2000',
                onBlur: formik.handleBlur,
                error: !!(formik.touched.model && formik.errors.model),
                helperText:
                  formik.touched.model && formik.errors.model
                    ? formik.errors.model
                    : '',
                required: true,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                placeholder: 'e.g. SHX00000000001',
                label: 'Serial Number',
                name: 'serialNumber',
                value: formik.values.serialNumber,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                name: 'unitCapacity',
                label: 'Unit Capacity',
                placeholder: 'e.g 1000 kg',
                value: formik.values.unitCapacity,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
                error: !!(
                  formik.touched.unitCapacity && formik.errors.unitCapacity
                ),
                helperText:
                  formik.touched.unitCapacity && formik.errors.unitCapacity
                    ? formik.errors.unitCapacity
                    : '',
                required: true,
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="start">kg</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                disabled: true,
                placeholder: 'Enter Spending Limit ',
                label: 'Spending Limit',
                name: 'spendingLimit',
                error: !!formik.errors.spendingLimit,
                value: formik.values.spendingLimit,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                name: 'emergencyContactNumber',
                label: 'Emergency Contact Number',
                placeholder: 'e.g. +49 1000 00000000',
                value: formik.values.emergencyContractNumber,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                name: 'yearBuilt',
                label: 'Year Built',
                placeholder: 'e.g. 2000',
                value: formik.values.yearBuilt,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                name: 'modelOfController',
                label: 'Model of Controller',
                placeholder: 'e.g. TX2000',
                value: formik.values.modelOfController,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                name: 'manufacturerOfController',
                label: 'Manufacturer of Controller',
                placeholder: 'e.g. Schneider',
                value: formik.values.manufacturerOfController,
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
