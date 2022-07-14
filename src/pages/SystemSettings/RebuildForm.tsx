import {useEffect} from 'react';
import {Box} from '@mui/system';
import {Grid} from '@mui/material';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import {FormSelect} from 'components/form/FormSelect';
import {FormInput} from 'components/form/FormInput';
import {Button} from 'components/Button';
import {convertToText} from 'utils/utils';
import {useRebuildIndex} from 'hooks/reactQuery/useSystem';
import {RebuildFormModel} from './models';

export const types = [
  {
    label: 'SERVICE_COMPANY',
    value: 'SERVICE_COMPANY',
  },
  {
    label: 'PROPERTY_OWNER',
    value: 'PROPERTY_OWNER',
  },
  {
    label: 'USER',
    value: 'USER',
  },
  {
    label: 'ELEVATOR',
    value: 'ELEVATOR',
  },
  {
    label: 'ELEVATOR_COMMENT',
    value: 'ELEVATOR_COMMENT',
  },
  {
    label: 'ELEVATOR_BREAKDOWN',
    value: 'ELEVATOR_BREAKDOWN',
  },
  {
    label: 'CONTRACT',
    value: 'CONTRACT',
  },
  {
    label: 'SERVICE_ORDER',
    value: 'SERVICE_ORDER',
  },
  {
    label: 'SERVICE_ORDER_REPORT',
    value: 'SERVICE_ORDER_REPORT',
  },
  {
    label: 'ARTICLE',
    value: 'ARTICLE',
  },
  {
    label: 'QUOTATION',
    value: 'QUOTATION',
  },
  {
    label: 'INVOICE',
    value: 'INVOICE',
  },
  {
    label: 'CHECK_LIST',
    value: 'CHECK_LIST',
  },
  {
    label: 'TIME_LOG',
    value: 'TIME_LOG',
  },
  {
    label: 'NOTIFICATION',
    value: 'NOTIFICATION',
  },
];

const validationSchema = Yup.object().shape({
  type: Yup.string().nullable().required('Type is required'),
  id: Yup.string().nullable().required('Id is required'),
});

export const RebuildForm = () => {
  const formik = useFormik<RebuildFormModel>({
    initialValues: {
      type: '',
      id: '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const {mutateAsync: rebuildIndex} = useRebuildIndex(
    'Index rebuild request placed successfully',
  );

  const onRebuild = async () => {
    const response = await rebuildIndex(formik.values);

    if (response) {
      formik.resetForm();
    }
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
      <Grid item xs={3}>
        <Box>
          <FormSelect
            labelId="type-label"
            label="Index Name"
            options={types.map(({label, value}) => ({
              label: convertToText(label),
              value,
            }))}
            selectProps={{
              id: 'type',
              value: formik.values.type,
              error: !!(formik.touched.type && formik.errors.type),
              name: 'type',
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            errorText={formik.touched.type && formik.errors.type}
            required
          />
        </Box>
      </Grid>
      <Grid item xs={3}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'eg. 12345',
            label: 'Entity ID',
            name: 'id',
            required: true,
            helperText: formik.touched.id && formik.errors.id,
            error: !!formik.errors.id && formik.touched.id,
            value: formik.values.id,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          label="Rebuild Index"
          buttonProps={{
            onClick: onRebuild,
            variant: 'contained',
            size: 'medium',
            disabled: !!Object.keys(formik.errors).length,
          }}>
          Rebuild
        </Button>
      </Grid>
    </Grid>
  );
};
