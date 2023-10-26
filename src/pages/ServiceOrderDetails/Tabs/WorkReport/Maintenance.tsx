import {FormikProps} from 'formik';
import {FormHelperText, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {CompleteServiceOrder, ServiceOrderView} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import {Construction, DirectionsCar} from '@mui/icons-material';
import {FormLabel} from 'components/form/FormLabel';
import {DatePicker} from 'components/DatePicker';
import {TimePicker} from 'components/TimePicker';
import {FormInput} from 'components/form/FormInput';
import {FormCheckbox} from 'components/form/FormCheckbox';

interface Props {
  serviceOrder: ServiceOrderView;
  formik: FormikProps<CompleteServiceOrder & {serviceTimeHM: string}>;
}
export const Maintenance = ({serviceOrder, formik}: Props) => {
  const schedule = serviceOrder.schedules?.[serviceOrder.schedules.length - 1];
  const {t} = useTranslation();

  return (
    <Box mt="1em">
      <FormLabel text="Maintenance" />
      {schedule && (
        <Box
          bgcolor="grey.50"
          border="1px solid"
          borderColor="grey.300"
          borderRadius="4px"
          p=".5em">
          <Box px="1rem" pt=".5rem" pb="1.5rem" display="flex">
            <Box display="flex" alignItems="center" gap={0.5} flex={1}>
              <DirectionsCar sx={{color: 'action.active'}} />
              <Typography variant="caption">{t('Travel')}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5} flex={1}>
              <Construction sx={{color: 'action.active'}} />
              <Typography variant="caption">{t('Work')}</Typography>
            </Box>
          </Box>
          <Box
            bgcolor="grey.50"
            boxShadow="0px 4px 15px 0px #90909033"
            p="1rem"
            display="flex"
            flexWrap="wrap">
            <Box display="flex" flexWrap="wrap" gap={1.2} flex={1}>
              <Box display="flex" gap={1.2}>
                <DatePicker
                  defaultDate={
                    formik.values.travelStartTime
                      ? new Date(formik.values.travelStartTime)
                      : null
                  }
                  containerStyles={{maxWidth: '11rem'}}
                  getSelectedDate={(travelStartTime) => {
                    if (travelStartTime) {
                      formik.setValues({
                        ...formik.values,
                        travelStartTime: travelStartTime.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'travelStartTime',
                    helperText:
                      formik.errors.travelStartTime &&
                      formik.touched.travelStartTime
                        ? formik.errors.travelStartTime
                        : '',
                    error: !!(
                      formik.touched.travelStartTime &&
                      formik.errors.travelStartTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />

                <TimePicker
                  defaultTime={
                    formik.values.travelStartTime
                      ? new Date(formik.values.travelStartTime)
                      : null
                  }
                  containerStyles={{maxWidth: '8rem'}}
                  getSelectedTime={(time) => {
                    if (time && !Number.isNaN(time.getTime())) {
                      formik.setValues({
                        ...formik.values,
                        travelEndTime: time.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'travelStartTime',
                    helperText:
                      formik.errors.travelStartTime &&
                      formik.touched.travelStartTime
                        ? formik.errors.travelStartTime
                        : '',
                    error: !!(
                      formik.errors.travelStartTime &&
                      formik.touched.travelStartTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />
              </Box>

              <Box display="flex" gap={1.2}>
                <DatePicker
                  defaultDate={
                    formik.values.travelEndTime
                      ? new Date(formik.values.travelEndTime)
                      : null
                  }
                  containerStyles={{maxWidth: '11rem'}}
                  getSelectedDate={(travelEndTime) => {
                    if (travelEndTime) {
                      formik.setValues({
                        ...formik.values,
                        travelEndTime: travelEndTime.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'travelEndTime',
                    helperText:
                      formik.errors.travelEndTime &&
                      formik.touched.travelEndTime
                        ? formik.errors.travelEndTime
                        : '',
                    error: !!(
                      formik.touched.travelEndTime &&
                      formik.errors.travelEndTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />

                <TimePicker
                  defaultTime={
                    formik.values.travelEndTime
                      ? new Date(formik.values.travelEndTime)
                      : null
                  }
                  containerStyles={{maxWidth: '8rem'}}
                  getSelectedTime={(time) => {
                    if (time && !Number.isNaN(time.getTime())) {
                      formik.setValues({
                        ...formik.values,
                        travelEndTime: time.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'travelEndTime',
                    helperText:
                      formik.errors.travelEndTime &&
                      formik.touched.travelEndTime
                        ? formik.errors.travelEndTime
                        : '',
                    error: !!(
                      formik.errors.travelEndTime &&
                      formik.touched.travelEndTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1.2} flex={1}>
              <Box display="flex" gap={1.2}>
                <DatePicker
                  defaultDate={
                    formik.values.startTime
                      ? new Date(formik.values.startTime)
                      : null
                  }
                  containerStyles={{maxWidth: '11rem'}}
                  getSelectedDate={(startTime) => {
                    if (startTime) {
                      formik.setValues({
                        ...formik.values,
                        startTime: startTime.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'startTime',
                    helperText:
                      formik.errors.startTime && formik.touched.startTime
                        ? formik.errors.startTime
                        : '',
                    error: !!(
                      formik.touched.startTime && formik.errors.startTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />

                <TimePicker
                  defaultTime={
                    formik.values.startTime
                      ? new Date(formik.values.startTime)
                      : null
                  }
                  containerStyles={{maxWidth: '8rem'}}
                  getSelectedTime={(time) => {
                    if (time && !Number.isNaN(time.getTime())) {
                      formik.setValues({
                        ...formik.values,
                        travelEndTime: time.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'startTime',
                    helperText:
                      formik.errors.startTime && formik.touched.startTime
                        ? formik.errors.startTime
                        : '',
                    error: !!(
                      formik.errors.startTime && formik.touched.startTime
                    ),
                    onBlur: formik.handleBlur,
                  }}
                />
              </Box>

              <Box display="flex" gap={1.2}>
                <DatePicker
                  defaultDate={
                    formik.values.endTime
                      ? new Date(formik.values.endTime)
                      : null
                  }
                  containerStyles={{maxWidth: '11rem'}}
                  getSelectedDate={(endTime) => {
                    if (endTime) {
                      formik.setValues({
                        ...formik.values,
                        endTime: endTime.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'endTime',
                    helperText:
                      formik.errors.endTime && formik.touched.endTime
                        ? formik.errors.endTime
                        : '',
                    error: !!(formik.touched.endTime && formik.errors.endTime),
                    onBlur: formik.handleBlur,
                  }}
                />

                <TimePicker
                  defaultTime={
                    formik.values.endTime
                      ? new Date(formik.values.endTime)
                      : null
                  }
                  containerStyles={{maxWidth: '8rem'}}
                  getSelectedTime={(time) => {
                    if (time && !Number.isNaN(time.getTime())) {
                      formik.setValues({
                        ...formik.values,
                        travelEndTime: time.toISOString(),
                      });
                    }
                  }}
                  textFieldProps={{
                    name: 'endTime',
                    helperText:
                      formik.errors.endTime && formik.touched.endTime
                        ? formik.errors.endTime
                        : '',
                    error: !!(formik.errors.endTime && formik.touched.endTime),
                    onBlur: formik.handleBlur,
                  }}
                />
              </Box>
            </Box>
            <Box
              display="flex"
              gap={5}
              alignItems="center"
              flexBasis="100%"
              pt={4}
              pb={1}>
              <Typography fontWeight={700} flexShrink={0}>
                {t('Total time')}
              </Typography>
              <Box display="flex" flexDirection="column">
                <FormInput
                  props={{
                    size: 'small',
                    placeholder: 'e.g. 13:40',
                    name: 'serviceTimeHM',
                    error:
                      !!formik.errors.serviceTimeHM &&
                      formik.touched.serviceTimeHM,
                    required: true,
                    value: formik.values.serviceTimeHM,
                    sx: {width: '6.25rem', input: {fontWeight: 700}},
                    onChange: formik.handleChange,
                    onBlur: formik.handleBlur,
                  }}
                />
                {formik.touched.serviceTimeHM &&
                  formik.errors.serviceTimeHM && (
                    <FormHelperText error>
                      {formik.errors.serviceTimeHM}
                    </FormHelperText>
                  )}
              </Box>
            </Box>
            <FormCheckbox
              checked={formik.values.onlyShowTotalTime ?? false}
              name="onlyShowTotalTime"
              handleChange={formik.handleChange}
              label={t('Show only total time to the customer')}
              typographyProps={{fontWeight: 500}}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
