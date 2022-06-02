import Grid from '@mui/material/Grid';
import {Box} from '@mui/system';
import {ComboBox} from 'components/ComboBox';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {useCacheValues} from 'hooks/reactQuery/useElevator';
import {ElevatorCategory} from 'models/elevator';
import {CacheTypes} from 'models/misc';
import {useState} from 'react';
import {createEmptyResource} from 'utils/paging-utils';
import {convertToText} from 'utils/utils';
import {UnitDetailsFormModel} from '../models';

interface Props {
  formik: FormikProps<UnitDetailsFormModel>;
}

export const EditUnitDetailsForm = ({formik}: Props) => {
  const [unitTypeQuery, setUnitTypeQuery] = useState('');
  const [modelQuery, setModelQuery] = useState('');
  const [capacityQuery, setCapacityQuery] = useState('');
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

  const {data: elevatorCapacityResource = createEmptyResource<string>()} =
    useCacheValues(
      {
        pageIndex: 0,
        pageSize: 10,
        query: capacityQuery,
      },
      CacheTypes.ELEVATOR_CAPACITY,
    );

  return (
    <Box sx={{mt: '0.5em'}} component="form">
      <Grid container spacing={2}>
        <Grid item md={6}>
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
            }}
          />
          {/* {console.log(formik.values, '--------------')} */}
          <FormInput
            props={{
              placeholder: 'Enter Manufacturer',
              label: 'Manufacturer',
              name: 'manufacturer',
              value: formik.values.manufacturer,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
            }}
          />
          <FormInput
            props={{
              placeholder: 'Enter Unit Number',
              label: 'Unit Number',
              name: 'unitNumber',
              value: formik.values.unitNumber,
              error: !!(formik.touched.unitNumber && formik.errors.unitNumber),
              helperText: formik.errors.unitNumber,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
            }}
          />

          <FormInput
            props={{
              size: 'small',
              placeholder: 'Enter Number of Stops',
              label: 'Number of Stops',
              name: 'numberOfStops',
              value: formik.values.numberOfStops,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
            }}
          />

          <FormInput
            props={{
              size: 'small',
              placeholder: 'Enter Cabin type',
              label: 'Cabin Type',
              name: 'cabinType',
              value: formik.values.cabinType,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
            }}
          />

          <FormInput
            props={{
              size: 'small',
              placeholder: 'Enter Emergency Phone Provider',
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
              placeholder: 'Enter Unit Type',
              name: 'unitType',
              label: 'Unit Type',
            }}
          />

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
              placeholder: 'Enter Model',
            }}
          />
          <FormInput
            props={{
              placeholder: 'EnterSerial Number',
              label: 'Serial Number',
              name: 'serialNumber',
              value: formik.values.serialNumber,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
            }}
          />

          <ComboBox
            options={elevatorCapacityResource.data.map((item) => ({
              label: item,
              value: item,
            }))}
            getValue={(item) =>
              formik.setFieldValue('unitCapacity', item?.value)
            }
            initialValue={
              formik.values.unitCapacity
                ? {
                    label: formik.values.unitCapacity,
                    value: formik.values.unitCapacity,
                  }
                : null
            }
            initialQuery={formik.values.unitCapacity}
            getQuery={(item) => setCapacityQuery(item || '')}
            textFieldProps={{
              name: 'unitCapacity',
              label: 'Unit Capacity',
              placeholder: 'Enter Capacity',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
