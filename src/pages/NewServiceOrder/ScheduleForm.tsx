import Box from '@mui/material/Box';
import {DatePicker} from 'components/DatePicker';
import {useFormik} from 'formik';
import {TechnicianView} from 'models/technician';
import {useEffect} from 'react';
import * as Yup from 'yup';
import {ScheduleTechnicianForm} from './models';

// open?: boolean;
// onSave: () => void;
// onCancel: () => void;
// title: string;
// defaultTechnician?: Technician | null;
// defaultStartDate?: Date | null;
// defaultEndDate?: Date | null;
// getFormValues?: (values: ScheduleForm) => void;
// getFormErrors?: (errors: FormikErrors<ScheduleForm>) => void;
// getSwitchState?: (value: boolean) => void;
// disableSaveBtn?: boolean;
// showSwitch?: boolean;

interface Props {
  defaultStartDate: Date | null;
  defaultEndDate: Date | null;
  defaultTechnician: TechnicianView | null;
  getFormValues?: (value: ScheduleTechnicianForm) => void;
}

const validationSchema = Yup.object().shape({
  date: Yup.string().nullable().required('date is required'),
  startTime: Yup.string().nullable().required('start time is required'),
  endTime: Yup.string().nullable().required('end time is required'),
});

export const ScheduleForm = ({
  defaultStartDate,
  defaultEndDate,
  defaultTechnician,
  getFormValues,
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

  return (
    <Box>
      <DatePicker
        defaultDate={defaultStartDate}
        inputError={
          formik.errors.date && formik.touched.date ? formik.errors.date : ''
        }
        containerStyles={{mr: '1em'}}
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
    </Box>
  );
};
