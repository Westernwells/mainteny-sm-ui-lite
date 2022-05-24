import Box from '@mui/material/Box';
import {DatePicker} from 'components/DatePicker';
import {TimePicker} from 'components/TimePicker';
import {startOfDay} from 'date-fns';
import {useFormik} from 'formik';
import {TechnicianView} from 'models/technician';
import {useEffect} from 'react';
import * as Yup from 'yup';
import {ScheduleTechnicianForm} from './models';
import {TechnicianAutoComplete} from './TechnicianAutoComplete';

interface Props {
  defaultStartDate: Date | null;
  defaultEndDate: Date | null;
  defaultTechnician: TechnicianView | null;
  getFormValues?: (value: ScheduleTechnicianForm) => void;
  getTechnician?: (val: TechnicianView | null) => void;
  getQuery?: (val: string) => void;
  containerStyles?: {[key: string]: any};
  formIsErrored?: (value: boolean) => void;
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
  getFormValues,
  containerStyles,
  getTechnician,
  getQuery,
  formIsErrored,
}: Props) => {
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
    if (getFormValues) {
      getFormValues({...formik.values});
    }
  }, [formik.values]);

  useEffect(() => {
    if (formIsErrored) {
      formIsErrored(!!Object.keys(formik.errors).length);
    }
  }, [formik.errors]);

  return (
    <Box sx={{...containerStyles}}>
      <DatePicker
        defaultDate={defaultStartDate}
        fieldStyles={{width: '100%'}}
        inputError={
          formik.errors.date && formik.touched.date ? formik.errors.date : ''
        }
        containerStyles={{mr: '1em', width: '100%'}}
        minDate={startOfDay(new Date())}
        handleBlur={formik.handleBlur}
        getSelectedDate={(date) => {
          formik.setValues({
            ...formik.values,
            date,
          });
        }}
        label="Due date"
        inputName="date"
      />

      <Box sx={{display: 'flex', mt: '1.4em'}}>
        <TimePicker
          defaultTime={defaultStartDate}
          inputError={
            formik.errors.startTime && formik.touched.startTime
              ? formik.errors.startTime
              : ''
          }
          handleBlur={formik.handleBlur}
          containerStyles={{mr: '1em'}}
          getSelectedTime={(time) => {
            formik.setValues({
              ...formik.values,
              startTime: time,
            });
          }}
          label="Start Time"
          inputName="startTime"
        />

        <TimePicker
          defaultTime={defaultEndDate}
          inputError={
            formik.errors.endTime && formik.touched.endTime
              ? formik.errors.endTime
              : ''
          }
          handleBlur={formik.handleBlur}
          getSelectedTime={(time) => {
            formik.setValues({
              ...formik.values,
              endTime: time,
            });
          }}
          label="End Time"
          inputName="endTime"
        />
      </Box>
      <Box sx={{mt: '1.4em'}}>
        <TechnicianAutoComplete
          inputError={
            formik.errors.technicianId && formik.touched.technicianId
              ? formik.errors.technicianId
              : ''
          }
          handleBlur={formik.handleBlur}
          getTechnician={(value) => {
            formik.setValues({
              ...formik.values,
              technicianId: value ? value.id : null,
            });
            if (getTechnician) {
              getTechnician(value);
            }
          }}
          label="Assign To"
          getQuery={(val) => {
            if (getQuery) {
              getQuery(val);
            }
          }}
        />
      </Box>
    </Box>
  );
};
