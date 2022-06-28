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
import {useTranslation} from 'react-i18next';

interface Props {
  getUnitDetailsFormErrors?: (val: FormikErrors<UnitDetailsFormModel>) => void;
  getUnitDetailsFormValues?: (val: FormikValues) => void;
  initialValues?: UnitDetailsFormModel;
}

const validationSchema = Yup.object().shape({
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
      externalId: initialValues?.externalId,
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
  const {t} = useTranslation();

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
                label: t(convertToText(item)),
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
                label: t('Unit Category'),
                onBlur: formik.handleBlur,
                error: !!(formik.touched.category && formik.errors.category),
                helperText:
                  formik.touched.category && formik.errors.category
                    ? formik.errors.category
                    : '',
                placeholder: t('e.g. Elevator'),
                required: true,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                placeholder: t('e.g. Elevator Installation Meier'),
                label: t('Manufacturer'),
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
                placeholder: t('e.g. 000001'),
                label: t('Unit Number'),
                name: 'externalId',
                value: formik.values.externalId,
                error: !!(
                  formik.touched.externalId && formik.errors.externalId
                ),
                helperText:
                  formik.touched.externalId && formik.errors.externalId
                    ? formik.errors.externalId
                    : '',
                onBlur: formik.handleBlur,
                onChange: formik.handleChange,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: t('e.g. 10'),
                label: t('Number of Stops'),
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
                placeholder: t('e.g. 2 doors'),
                label: t('Cabin Type'),
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
                placeholder: t('e.g. SafeLine'),
                label: t('Emergency Phone Provider'),
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
                placeholder: t('e.g. Hydraulic'),
                name: 'unitType',
                label: t('Unit Type'),
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
                label: t('Model'),
                placeholder: t('e.g. S2000'),
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
                placeholder: t('e.g. SHX00000000001'),
                label: t('Serial Number'),
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
                label: t('Unit Capacity'),
                placeholder: t('e.g. 1000 kg'),
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
                placeholder: t('Enter Spending Limit'),
                label: t('Spending Limit'),
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
                label: t('Emergency Contact Number'),
                placeholder: t('e.g. +49 1000 00000000'),
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
                label: t('Year Built'),
                placeholder: t('e.g. 2000'),
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
                label: t('Model of Controller'),
                placeholder: t('e.g. TX2000'),
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
                label: t('Manufacturer of Controller'),
                placeholder: t('e.g. Schneider'),
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
