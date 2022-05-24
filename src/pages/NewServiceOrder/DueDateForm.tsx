import Box from '@mui/material/Box';
import {DatePicker} from 'components/DatePicker';
import {startOfDay} from 'date-fns';
import {useFormik} from 'formik';
import {useEffect} from 'react';
import * as Yup from 'yup';
import {DueDateFormProps} from './models';
// import {constant} from './utils';

interface Props {
  defaultStartDate: Date | null;
  getDueDateFormValues?: (value: DueDateFormProps) => void;
  containerStyles?: {[key: string]: any};
  dueFormIsErrored?: (value: boolean) => void;
}

const validationSchema = Yup.object().shape({
  date: Yup.string().nullable().required('Date is required'),
});

export const DueDateForm = ({
  defaultStartDate,
  getDueDateFormValues,
  containerStyles,
  dueFormIsErrored,
}: Props) => {
  const formik = useFormik<DueDateFormProps>({
    initialValues: {
      date: defaultStartDate || null,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getDueDateFormValues) {
      getDueDateFormValues({...formik.values});
    }
  }, [formik.values]);

  useEffect(() => {
    if (dueFormIsErrored) {
      dueFormIsErrored(!!Object.keys(formik.errors).length);
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
    </Box>
  );
};
