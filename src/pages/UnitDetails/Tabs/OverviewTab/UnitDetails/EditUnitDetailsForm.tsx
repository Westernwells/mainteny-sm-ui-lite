import Grid from '@mui/material/Grid';
import {ComboBox} from 'components/ComboBox';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {useCacheValues} from 'hooks/reactQuery/useElevator';
import {ElevatorCategory} from 'models/elevator';
import {CacheTypes} from 'models/misc';
import {UnitDetailsFormModel} from 'models/unitForm';
import {useState} from 'react';
import {createEmptyResource} from 'utils/paging-utils';
import {convertToText} from 'utils/utils';
import {useTranslation} from 'react-i18next';

interface Props {
  formik: FormikProps<UnitDetailsFormModel>;
}

export const EditUnitDetailsForm = ({formik}: Props) => {
  const {t} = useTranslation();
  const [unitTypeQuery, setUnitTypeQuery] = useState('');
  const [modelQuery, setModelQuery] = useState('');
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

  return (
    <Grid container spacing={2} sx={{mt: '0.5em'}} component="form">
      <Grid item md={6}>
        <ComboBox
          options={Object.keys(ElevatorCategory).map((item) => ({
            label: t(convertToText(item)),
            value: convertToText(item),
          }))}
          initialValue={
            formik.values.category
              ? {
                  label: t(formik.values.category),
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
            helperText: formik.errors.category,
            placeholder: t('e.g Escalator'),
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'E.g. Thyssenkrupp, schindler',
            label: 'Manufacturer',
            name: 'manufacturer',
            value: formik.values.manufacturer,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'e.g. 100001',
            label: 'Unit Number',
            name: 'externalId',
            value: formik.values.externalId,
            error: !!(formik.touched.externalId && formik.errors.externalId),
            helperText: formik.errors.externalId,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'Can also be number of floors',
            label: 'Number of Stops',
            name: 'numberOfStops',
            type: 'number',
            inputProps: {min: 0},
            value: formik.values.numberOfStops,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'Single door; Double door',
            label: 'Cabin Type',
            name: 'cabinType',
            value: formik.values.cabinType,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. SafeLine',
            label: 'Emergency Phone Provider',
            name: 'emergencyPhoneProvider',
            value: formik.values.emergencyPhoneProvider,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
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
            placeholder: t('Automatic, manual, etc'),
            name: 'unitType',
            label: t('Unit Type'),
          }}
        />
      </Grid>

      <Grid item md={6}>
        <ComboBox
          options={elevatorModelsResource.data.map((item) => ({
            label: item,
            value: item,
          }))}
          getValue={(item) => {
            formik.setFieldValue('model', item?.value);
          }}
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
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            placeholder: 'Fabric number',
            label: 'Serial Number',
            name: 'serialNumber',
            value: formik.values.serialNumber,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            name: 'unitCapacity',
            label: 'Unit Capacity',
            placeholder: '1000 kg',
            value: formik.values.unitCapacity,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'Enter Spending Limit',
            label: 'Spending Limit',
            name: 'spendingLimit',
            error: !!formik.errors.spendingLimit,
            value: formik.values.spendingLimit,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>

      <Grid item md={6}>
        <FormInput
          props={{
            name: 'yearBuilt',
            label: 'Year Built',
            placeholder: 'Enter year build',
            type: 'number',
            inputProps: {min: 0},
            value: formik.values.yearBuilt,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />
      </Grid>
    </Grid>
  );
};
