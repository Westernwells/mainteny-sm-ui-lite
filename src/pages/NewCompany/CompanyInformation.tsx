import {useEffect} from 'react';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';

import {PageCard} from 'components/PageCard';
import {FormInput} from 'components/form/FormInput';
import {CompanyInformationFormModel} from './model';

interface Props {
  getCompanyInformationFormErrors?: (
    val: FormikErrors<CompanyInformationFormModel>,
  ) => void;
  getCompanyInformationFormValues?: (val: CompanyInformationFormModel) => void;
  initialValues: CompanyInformationFormModel;
}

const validationSchema = Yup.object().shape({
  managingDirector: Yup.string()
    .nullable()
    .required('Managing Director is required'),
  arbitrationCourt: Yup.string()
    .nullable()
    .required('Arbitration Court is required'),
  tradeRegisterNumber: Yup.string()
    .nullable()
    .required('Trade Register Number is required'),
});

export const CompanyInformation = ({
  getCompanyInformationFormErrors,
  getCompanyInformationFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<CompanyInformationFormModel>({
    initialValues: {
      managingDirector: initialValues?.managingDirector || '',
      arbitrationCourt: initialValues?.arbitrationCourt || '',
      tradeRegisterNumber: initialValues?.tradeRegisterNumber || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getCompanyInformationFormErrors) {
      getCompanyInformationFormErrors(formik.errors);
    }

    if (getCompanyInformationFormValues) {
      getCompanyInformationFormValues(formik.values);
    }
  }, [formik]);

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <PageCard
      headerLabel="Company Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. Wolfgang Lutz',
                label: 'Managing Director',
                name: 'managingDirector',
                helperText:
                  formik.touched.managingDirector &&
                  formik.errors.managingDirector,
                error:
                  !!formik.errors.managingDirector &&
                  formik.touched.managingDirector,
                required: true,
                value: formik.values.managingDirector,
                sx: {mb: '1em'},
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. Berlin',
                label: 'Arbitration Court',
                name: 'arbitrationCourt',
                required: true,
                helperText:
                  formik.touched.arbitrationCourt &&
                  formik.errors.arbitrationCourt,
                error:
                  !!formik.errors.arbitrationCourt &&
                  formik.touched.arbitrationCourt,
                value: formik.values.arbitrationCourt,
                sx: {mb: '1em'},
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g. HRB 151080 B, Charlottenburg',
                label: 'Trade Register Number',
                name: 'tradeRegisterNumber',
                required: true,
                helperText:
                  formik.touched.tradeRegisterNumber &&
                  formik.errors.tradeRegisterNumber,
                error:
                  !!formik.errors.tradeRegisterNumber &&
                  formik.touched.tradeRegisterNumber,
                value: formik.values.tradeRegisterNumber,
                sx: {mb: '1em'},
                ...defaultProps,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
