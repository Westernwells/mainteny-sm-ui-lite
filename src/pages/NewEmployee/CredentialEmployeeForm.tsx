import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormikErrors, useFormik} from 'formik';
import * as Yup from 'yup';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import {InputAdornment} from '@mui/material';
import {PageCard} from 'components/PageCard';
import {CredentialEmployeeFormModel} from 'models/employee';
import {FormInput} from 'components/form/FormInput';

interface Props {
  getCredentialEmployeeFormErrors?: (
    val: FormikErrors<CredentialEmployeeFormModel>,
  ) => void;
  getCredentialEmployeeFormValues?: (val: CredentialEmployeeFormModel) => void;
  initialValues?: CredentialEmployeeFormModel;
}

export const CredentialEmployeeForm = ({
  getCredentialEmployeeFormErrors,
  getCredentialEmployeeFormValues,
  initialValues,
}: Props) => {
  const {t} = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required(t('This field is required'))
      .min(8, t('Must be at least 8 characters'))
      .matches(/\d/, t('Must contain 1 digit'))
      .matches(/.*[\W_]/, t('Must contain 1 special character')),
    confirmPassword: Yup.string()
      .required(t('This field is required'))
      .oneOf([Yup.ref('password'), null], t('Passwords must match')),
  });

  const formik = useFormik<CredentialEmployeeFormModel>({
    initialValues: {
      password: initialValues?.password || '',
      confirmPassword: initialValues?.confirmPassword || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getCredentialEmployeeFormErrors) {
      getCredentialEmployeeFormErrors(formik.errors);
    }

    if (getCredentialEmployeeFormValues) {
      getCredentialEmployeeFormValues(formik.values);
    }
  }, [formik]);

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <PageCard
      headerLabel="Password"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box component="form">
        <Grid container spacing={2}>
          <Grid item md={6}>
            <Box display="flex">
              <Box
                display="flex"
                sx={{maxWidth: '21.875em', marginRight: '1.563em'}}>
                {[
                  {
                    id: 'password',
                    label: 'Password',
                    placeholder: 'e.g. 13ofOhy65',
                    type: isPasswordVisible ? 'text' : 'password',
                    value: formik.values.password,
                    InputProps: {
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          sx={{cursor: 'pointer'}}>
                          <RemoveRedEye />
                        </InputAdornment>
                      ),
                    },
                    helperText:
                      formik.touched.password && formik.errors.password,
                    error: !!formik.errors.password && formik.touched.password,
                    required: true,
                  },
                ].map((item, index) => (
                  <FormInput
                    key={index}
                    fieldProps={{
                      ...item,
                      ...defaultProps,
                    }}
                  />
                ))}
              </Box>
              <Box display="flex" sx={{maxWidth: '21.875em'}}>
                {[
                  {
                    id: 'confirmPassword',
                    label: 'Repeat Password',
                    placeholder: 'e.g. 13ofOhy65',
                    type: isPasswordVisible ? 'text' : 'password',
                    value: formik.values.confirmPassword,
                    InputProps: {
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          sx={{cursor: 'pointer'}}>
                          <RemoveRedEye />
                        </InputAdornment>
                      ),
                    },
                    helperText:
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword,
                    error:
                      !!formik.errors.confirmPassword &&
                      formik.touched.confirmPassword,
                    required: true,
                  },
                ].map((item, index) => (
                  <FormInput
                    key={index}
                    fieldProps={{
                      ...item,
                      ...defaultProps,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};
