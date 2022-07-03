import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {DatePicker} from 'components/DatePicker';
import {TimePicker} from 'components/TimePicker';
import {startOfDay} from 'date-fns';
import {useFormik} from 'formik';
import {useEffect} from 'react';
import * as Yup from 'yup';
import {EmployeesView} from 'models/employee';
import {RadioOptions, ScheduleTechnicianForm} from './models';
import {TechnicianAutoComplete} from '../../components/TechnicianAutoComplete';

interface Props {
  defaultStartDate: Date | null;
  defaultEndDate: Date | null;
  defaultTechnician: EmployeesView | null;
  getScheduleFormValues?: (value: ScheduleTechnicianForm) => void;
  getTechnician?: (val: EmployeesView | null) => void;
  getQuery?: (val: string) => void;
  containerStyles?: {[key: string]: any};
  scheduleFormIsErrored?: (value: boolean) => void;
  currentRadioOption: RadioOptions;
}

const validationSchema = Yup.object().shape({
  date: Yup.string().nullable().required('Date is required'),
  startTime: Yup.string().nullable().required('Start time is required'),
  endTime: Yup.string().nullable().required('End time is required'),
  technicianId: Yup.string().nullable().required('Technician is required'),
});

export const ScheduleForm = ({
  defaultStartDate,
  defaultEndDate,
  defaultTechnician,
  getScheduleFormValues,
  containerStyles,
  getTechnician,
  getQuery,
  scheduleFormIsErrored,
  currentRadioOption,
}: Props) => {
  const {t} = useTranslation();
  const formik = useFormik<ScheduleTechnicianForm>({
    initialValues: {
      date: defaultStartDate || null,
      startTime: defaultStartDate || null,
      endTime: defaultEndDate || null,
      technicianId: defaultTechnician?.id || null,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getScheduleFormValues) {
      getScheduleFormValues({...formik.values});
    }
  }, [formik.values]);

  useEffect(() => {
    if (scheduleFormIsErrored) {
      scheduleFormIsErrored(!!Object.keys(formik.errors).length);
    }
  }, [formik.errors]);

  return (
    <Box sx={{...containerStyles}}>
      <DatePicker
        defaultDate={defaultStartDate}
        containerStyles={{mr: '1em', width: '100%'}}
        minDate={startOfDay(new Date())}
        getSelectedDate={(date) => {
          formik.setValues({
            ...formik.values,
            date,
          });
        }}
        textFieldProps={{
          label: t('Due date'),
          name: 'date',
          helperText:
            formik.errors.date && formik.touched.date ? formik.errors.date : '',
          error: !!(formik.touched.date && formik.errors.date),
          sx: {width: '100%'},
          onBlur: formik.handleBlur,
        }}
      />
      {currentRadioOption === RadioOptions.SCHEDULE_TECHNICIAN ? (
        <>
          <Box sx={{display: 'flex', mt: '1.4em'}}>
            <TimePicker
              defaultTime={defaultStartDate}
              containerStyles={{mr: '1em'}}
              getSelectedTime={(time) => {
                formik.setValues({
                  ...formik.values,
                  startTime: time,
                });
              }}
              textFieldProps={{
                label: t('Start Time'),
                name: 'startTime',
                helperText:
                  formik.errors.startTime && formik.touched.startTime
                    ? formik.errors.startTime
                    : '',
                error: !!(formik.errors.startTime && formik.touched.startTime),
                onBlur: formik.handleBlur,
              }}
            />

            <TimePicker
              defaultTime={defaultEndDate}
              getSelectedTime={(time) => {
                formik.setValues({
                  ...formik.values,
                  endTime: time,
                });
              }}
              textFieldProps={{
                label: t('End Time'),
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
          <Box sx={{mt: '1.4em'}}>
            <TechnicianAutoComplete
              getTechnician={(value) => {
                formik.setValues({
                  ...formik.values,
                  technicianId: value ? value.id : null,
                });
                if (getTechnician) {
                  getTechnician(value);
                }
              }}
              getQuery={(val) => {
                if (getQuery) {
                  getQuery(val);
                }
              }}
              textFieldProps={{
                error: !!(
                  formik.errors.technicianId && formik.touched.technicianId
                ),
                helperText:
                  formik.errors.technicianId && formik.touched.technicianId
                    ? formik.errors.technicianId
                    : '',
                label: t('Assign To'),
                onBlur: formik.handleBlur,
              }}
            />
          </Box>
        </>
      ) : null}
    </Box>
  );
};
