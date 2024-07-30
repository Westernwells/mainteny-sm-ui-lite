import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import {InspectionCycle, Priority} from 'models/misc';
import {ServiceFormModel} from 'models/unitForm';
import {useTranslation} from 'react-i18next';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {inspectionCycleLabels} from 'utils/elevator-utils';

interface Props {
  formik: FormikProps<ServiceFormModel>;
}

export const EditServiceForm = ({formik}: Props) => {
  const {t} = useTranslation();
  return (
    <Grid container spacing={2} component="form">
      <Grid item sm={12} md={6}>
        <DatePicker
          defaultDate={formik.values.lastVisitDate}
          getSelectedDate={(date) =>
            formik.setFieldValue('lastVisitDate', date)
          }
          textFieldProps={{
            label: t('Last Visit'),
            name: 'lastVisitDate',
            helperText:
              formik.errors.lastVisitDate && formik.touched.lastVisitDate
                ? formik.errors.lastVisitDate
                : '',
            error: !!(
              formik.touched.lastVisitDate && formik.errors.lastVisitDate
            ),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item sm={12} md={6}>
        <DatePicker
          defaultDate={formik.values.lastInspectionDate}
          getSelectedDate={(date) =>
            formik.setFieldValue('lastInspectionDate', date)
          }
          textFieldProps={{
            label: t('Last Inspection'),
            name: 'lastInspectionDate',
            helperText:
              formik.errors.lastInspectionDate &&
              formik.touched.lastInspectionDate
                ? formik.errors.lastInspectionDate
                : '',
            error: !!(
              formik.errors.lastInspectionDate &&
              formik.touched.lastInspectionDate
            ),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item sm={12} md={6}>
        <FormInput
          fieldProps={{
            label: 'Required Time',
            name: 'serviceTime',
            value: formik.values.serviceTime,
            helperText:
              formik.errors.serviceTime && formik.touched.serviceTime
                ? formik.errors.serviceTime
                : '',
            error: !!(formik.errors.serviceTime && formik.touched.serviceTime),
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            type: 'number',
            inputProps: {min: 0},
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <TimerOutlinedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid item sm={12} md={6}>
        <FormInput
          fieldProps={{
            label: 'No. of technicians',
            name: 'technicianNumber',
            value: formik.values.technicianNumber,
            helperText:
              formik.errors.technicianNumber && formik.touched.technicianNumber
                ? formik.errors.technicianNumber
                : '',
            error: !!(
              formik.errors.technicianNumber && formik.touched.technicianNumber
            ),
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            type: 'number',
            inputProps: {min: 0},
          }}
        />
      </Grid>

      <Grid item sm={12} md={6}>
        <FormSelect
          labelId="prioritySelect-label"
          label="Priority"
          options={Object.keys(Priority).map((key) => ({
            label: t(key),
            value: key,
          }))}
          selectProps={{
            id: 'prioritySelect',
            value: formik.values.priority ? formik.values.priority : undefined,
            onChange: formik.handleChange,
            name: 'priority',
          }}
        />
      </Grid>

      <Grid item md={6} sm={12}>
        <FormControl fullWidth>
          <InputLabel
            size="small"
            shrink
            variant="outlined"
            id="demo-simple-select-label">
            {t('Inspection Cycle')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            label={t('Inspection Cycle')}
            size="small"
            notched
            inputProps={{
              value: formik.values.inspectionCycle ?? '',
              defaultValue: formik.values.inspectionCycle ?? '',
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              name: 'inspectionCycle',
              sx: {width: '100%'},
            }}>
            <MenuItem value={InspectionCycle.NONE}>
              {t(inspectionCycleLabels[InspectionCycle.NONE])}
            </MenuItem>
            <MenuItem value={InspectionCycle.MONTHLY}>
              {t(inspectionCycleLabels[InspectionCycle.MONTHLY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.BIMONTHLY}>
              {t(inspectionCycleLabels[InspectionCycle.BIMONTHLY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.QUARTERLY}>
              {t(inspectionCycleLabels[InspectionCycle.QUARTERLY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.TERTIARY}>
              {t(inspectionCycleLabels[InspectionCycle.TERTIARY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.HALF_YEARLY}>
              {t(inspectionCycleLabels[InspectionCycle.HALF_YEARLY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.YEARLY}>
              {t(inspectionCycleLabels[InspectionCycle.YEARLY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.BIENNIALLY}>
              {t(inspectionCycleLabels[InspectionCycle.BIENNIALLY])}
            </MenuItem>
            <MenuItem value={InspectionCycle.TRIENNIALLY}>
              {t(inspectionCycleLabels[InspectionCycle.TRIENNIALLY])}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
