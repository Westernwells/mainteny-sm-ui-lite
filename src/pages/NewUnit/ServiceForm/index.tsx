import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikValues, useFormik} from 'formik';
import {ServiceFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect} from 'react';
import {PageCard} from 'components/PageCard';
import {DatePicker} from 'components/DatePicker';
import {FormSelect} from 'components/form/FormSelect';
import {convertToText} from 'utils/utils';
import {Priority} from 'models/misc';
import {useTranslation} from 'react-i18next';

interface Props {
  getServiceFormErrors?: (val: FormikErrors<ServiceFormModel>) => void;
  getServiceFormValues?: (val: FormikValues) => void;
  initialValues?: ServiceFormModel;
}

const validationSchema = Yup.object().shape({
  lastVisitDate: Yup.string().nullable().required('Last visit is required'),
  serviceTime: Yup.string().nullable().required('Service time is required'),
  technicianNumber: Yup.number()
    .nullable()
    .required('No. of technicians is required'),
});

export const ServiceForm = ({
  getServiceFormErrors,
  getServiceFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<ServiceFormModel>({
    initialValues: {
      lastVisitDate: initialValues?.lastVisitDate
        ? new Date(initialValues?.lastVisitDate)
        : undefined,
      lastInspectionDate: initialValues?.lastInspectionDate,

      visitsPerYear: initialValues?.visitsPerYear,
      serviceTime: initialValues?.serviceTime,
      technicianNumber: initialValues?.technicianNumber,
      priority: initialValues?.priority,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getServiceFormErrors) {
      getServiceFormErrors(formik.errors);
    }

    if (getServiceFormValues) {
      getServiceFormValues(formik.values);
    }
  }, [formik]);

  const {t} = useTranslation();
  return (
    <PageCard
      headerLabel="Service Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item md={4}>
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
                required: true,
              }}
            />
          </Grid>

          <Grid item md={4}>
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

          <Grid item md={4}>
            <FormInput
              props={{
                disabled: true,
                label: 'Visits per Year',
                name: 'VisitsPerYear',
                value: formik.values.visitsPerYear,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'Required time',
                name: 'serviceTime',
                placeholder: t('e.g. 45 min'),
                value: formik.values.serviceTime,
                helperText:
                  formik.errors.serviceTime && formik.touched.serviceTime
                    ? formik.errors.serviceTime
                    : '',
                error: !!(
                  formik.errors.serviceTime && formik.touched.serviceTime
                ),
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
                required: true,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'No. of Technicians',
                name: 'technicianNumber',
                value: formik.values.technicianNumber,
                helperText:
                  formik.errors.technicianNumber &&
                  formik.touched.technicianNumber
                    ? formik.errors.technicianNumber
                    : '',
                error: !!(
                  formik.errors.technicianNumber &&
                  formik.touched.technicianNumber
                ),
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
                required: true,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormSelect
              labelId="prioritySelect-label"
              label="Priority"
              options={Object.keys(Priority).map((key) => ({
                label: convertToText(key),
                value: convertToText(key),
              }))}
              selectProps={{
                id: 'prioritySelect',
                value: formik.values.priority
                  ? formik.values.priority
                  : undefined,
                onChange: formik.handleChange,
                name: 'priority',
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
