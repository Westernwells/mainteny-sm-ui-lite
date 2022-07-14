import {useEffect, useState} from 'react';
import {Box} from '@mui/system';
import {Grid, Typography} from '@mui/material';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import {FormSelect} from 'components/form/FormSelect';
import {Button} from 'components/Button';
import {useCreateIndex} from 'hooks/reactQuery/useSystem';
import {convertToText} from 'utils/utils';
import {CreationFormModel} from './models';
import {types} from './RebuildForm';

const validationSchema = Yup.object().shape({
  type: Yup.string().nullable().required('Type is required'),
});

export const CreationForm = () => {
  const [createdIndex, setCreatedIndex] = useState<string>('');

  const formik = useFormik<CreationFormModel>({
    initialValues: {
      type: '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  const {mutateAsync: createIndex} = useCreateIndex(
    'Index was created successfully',
  );

  const onCreate = async () => {
    const response = await createIndex(formik.values.type);

    if (response) {
      setCreatedIndex(response.value);
      formik.resetForm();
    }
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  const handleBlur = () => {
    setCreatedIndex('');
    formik.handleBlur('type');
  };

  return (
    <>
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
                onBlur: handleBlur,
              }}
              errorText={formik.touched.type && formik.errors.type}
              required
            />
          </Box>
        </Grid>
        <Grid item xs={3} />
        <Grid item xs={2}>
          <Button
            label="Create Index"
            buttonProps={{
              onClick: onCreate,
              variant: 'contained',
              size: 'medium',
              disabled: !!Object.keys(formik.errors).length,
            }}>
            Create
          </Button>
        </Grid>
      </Grid>
      {createdIndex && (
        <Typography sx={{mt: '1em'}}>Created index: {createdIndex}</Typography>
      )}
    </>
  );
};
