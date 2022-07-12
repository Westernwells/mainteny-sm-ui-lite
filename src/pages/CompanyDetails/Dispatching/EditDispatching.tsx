import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {Box, Typography} from '@mui/material';

import {FormSelect} from 'components/form/FormSelect';
import {Switch} from 'components/Switch';
import {convertToText} from 'utils/utils';
import {DispatchStrategy} from 'models/misc';
import {DispatchingCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<DispatchingCompanyFormModel>;
}

export const EditDispatching = ({formik}: Props) => {
  const defaultProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{mb: '0.625em'}}>
          <Typography variant="body1" sx={{color: 'text.primary'}}>
            Daily Dispatch (Nightly Shuffle)
          </Typography>
          <Switch
            value={formik.values.nightlyShuffleEnabled}
            onChanged={(value) =>
              formik.setFieldValue('nightlyShuffleEnabled', value)
            }
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <FormSelect
          labelId="companyDispatchStrategy-label"
          label="Dispatching Strategy"
          options={Object.keys(DispatchStrategy).map((item) => ({
            label: convertToText(item),
            value: item,
          }))}
          selectProps={{
            id: 'companyDispatchStrategy',
            value: formik.values.companyDispatchStrategy,
            error: !!(
              formik.touched.companyDispatchStrategy &&
              formik.errors.companyDispatchStrategy
            ),
            name: 'companyDispatchStrategy',
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};
