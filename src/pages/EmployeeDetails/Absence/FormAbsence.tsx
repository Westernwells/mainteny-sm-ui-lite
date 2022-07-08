import {Sick, WbSunny} from '@mui/icons-material';
import {Avatar, Box, Grid, TextField, Typography} from '@mui/material';
import {FormikProps} from 'formik';
import {Role} from 'models/user';

import {DatePicker} from 'components/DatePicker';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {capitalize} from 'utils/utils';
import {AbsenceForm} from './model';

type Props = {
  name: string;
  roles: Role[];
  formik: FormikProps<AbsenceForm>;
};

const FormAbsence = ({formik, roles, name}: Props) => (
  <Box>
    <Box sx={{background: '#edf7fe', padding: '1.250em'}} display="flex">
      <Avatar
        alt=""
        src=""
        variant="circular"
        sx={{
          width: '3.125em',
          height: '3.125em',
          aspectRatio: '1',
          marginRight: '0.625em',
        }}
      />
      <Box display="flex" flexDirection="column">
        <Typography
          variant="subtitle1"
          textAlign="left"
          sx={{color: 'text.primary', fontSize: '16px'}}>
          {name}
        </Typography>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          textAlign="left"
          sx={{fontSize: '0.875em'}}>
          {roles ? `${capitalize(roles as string[])}` : ''}
        </Typography>
      </Box>
    </Box>
    <Box>
      <Typography
        variant="subtitle2"
        sx={{color: 'text.primary', margin: '1.5em 0 0.938em 0'}}>
        Select type of absence
      </Typography>

      <Grid container spacing="1.500em" justifyContent="space-between">
        <Grid md={6} item>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={() => formik.setFieldValue('typeAbsence', 'Sick')}
            sx={{
              border: '1px solid',
              borderColor:
                formik.values.typeAbsence === 'Sick'
                  ? 'primary.main'
                  : '#ecf1f3',
              width: '100%',
              transition: '0.2s',
              borderRadius: '0.250em',
              padding: '1.25em 0',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}>
            <Sick />
            <Typography sx={{marginTop: '0.625em'}}>Sick</Typography>
          </Box>
        </Grid>
        <Grid md={6} item>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={() => formik.setFieldValue('typeAbsence', 'Holiday')}
            sx={{
              border: '1px solid',
              borderColor:
                formik.values.typeAbsence === 'Holiday'
                  ? 'primary.main'
                  : '#ecf1f3',
              width: '100%',
              transition: '0.2s',
              borderRadius: '0.250em',
              padding: '1.25em 0',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}>
            <WbSunny sx={{color: 'amber.main'}} />
            <Typography sx={{marginTop: '0.625em'}}>Holiday</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
    <Box>
      <Typography
        variant="subtitle2"
        sx={{color: 'text.primary', margin: '1.5em 0'}}>
        Select duration
      </Typography>
      <MultipleSelectCheckmarks
        label="Duration"
        options={['1 day', 'Multiple days']}
        disableClearBtn
        initialSelectedItems={formik.values.duration}
        getSelectedValue={(item) => formik.setFieldValue('duration', item)}
        multiple={false}
        containerStyles={{width: '100%', mb: '1.5em'}}
        formControlStyles={{width: '100%'}}
      />
      {formik.values.duration[0] === '1 day' && (
        <DatePicker
          defaultDate={formik.values.date}
          getSelectedDate={(newValue) => {
            if (newValue) formik.setFieldValue('date', newValue);
          }}
          textFieldProps={{
            label: 'Date',
          }}
          containerStyles={{mb: '1.5em'}}
        />
      )}
      {formik.values.duration[0] === 'Multiple days' && (
        <>
          <DatePicker
            defaultDate={formik.values.dateStart}
            getSelectedDate={(newValue) => {
              if (newValue) formik.setFieldValue('dateStart', newValue);
            }}
            textFieldProps={{
              label: 'Date start',
              name: 'dateStart',
              helperText:
                formik.errors.dateStart && formik.touched.dateStart
                  ? formik.errors.dateStart
                  : '',
              error: !!(formik.touched.dateStart && formik.errors.dateStart),
              onBlur: formik.handleBlur,
            }}
            maxDate={
              formik.values.dateEnd
                ? new Date(formik.values.dateEnd)
                : undefined
            }
            containerStyles={{mb: '1.5em'}}
          />
          <DatePicker
            defaultDate={formik.values.dateEnd}
            getSelectedDate={(newValue) => {
              if (newValue) formik.setFieldValue('dateEnd', newValue);
            }}
            textFieldProps={{
              label: 'Date end',
              name: 'dateEnd',
              helperText:
                formik.errors.dateEnd && formik.touched.dateEnd
                  ? formik.errors.dateEnd
                  : '',
              error: !!(formik.touched.dateEnd && formik.errors.dateEnd),
              onBlur: formik.handleBlur,
            }}
            minDate={
              formik.values.dateStart
                ? new Date(formik.values.dateStart)
                : undefined
            }
            containerStyles={{mb: '1.5em'}}
          />
        </>
      )}
      <TextField
        label="Reason"
        multiline
        rows={5}
        placeholder="Enter reason"
        variant="outlined"
        value={formik.values.notes}
        onChange={(e) => formik.setFieldValue('notes', e.target.value)}
        InputLabelProps={{shrink: true}}
        sx={{width: '100%', mt: '0.5em'}}
      />
    </Box>
  </Box>
);

export default FormAbsence;
