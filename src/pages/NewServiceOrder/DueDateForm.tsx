import Box from '@mui/material/Box';
import {IconButton, Typography, Tooltip} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import {DatePicker} from 'components/DatePicker';
import {useFormik} from 'formik';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import * as Yup from 'yup';
import {DueDateFormProps} from './models';

interface Props {
  defaultStartDate: Date | null;
  getDueDateFormValues?: (value: DueDateFormProps) => void;
  containerStyles?: {[key: string]: any};
  dueDateFormIsErrored?: (value: boolean) => void;
}

const validationSchema = Yup.object().shape({
  date: Yup.string().nullable().required('Date is required'),
});

export const DueDateForm = ({
  defaultStartDate,
  getDueDateFormValues,
  containerStyles,
  dueDateFormIsErrored,
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
    if (dueDateFormIsErrored) {
      dueDateFormIsErrored(!!Object.keys(formik.errors).length);
    }
  }, [formik.errors]);

  const {t} = useTranslation();

  return (
    <Box sx={{...containerStyles}}>
      <Box display="flex" alignItems="center" gap={0.5} pb={0.5}>
        <Typography variant="subtitle2">
          {t('Select due date')}
          <span style={{color: '#FC5555'}}>*</span>
        </Typography>
        <Tooltip
          title={t('Latest date this job has to be completed')}
          placement="top"
          arrow
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -10],
                },
              },
            ],
          }}>
          <IconButton sx={{color: 'action.active', p: 0}}>
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <DatePicker
        defaultDate={defaultStartDate}
        containerStyles={{mr: '1em', width: '100%'}}
        getSelectedDate={(date) => {
          formik.setValues({
            ...formik.values,
            date,
          });
        }}
        textFieldProps={{
          label: '',
          name: 'date',
          required: true,
          helperText:
            formik.errors.date && formik.touched.date ? formik.errors.date : '',
          error: !!(formik.touched.date && formik.errors.date),
          sx: {width: '100%'},
          onBlur: formik.handleBlur,
        }}
      />
    </Box>
  );
};
