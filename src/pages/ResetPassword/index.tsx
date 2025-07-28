import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import {useFormik} from 'formik';
import queryString from 'query-string';
import * as Yup from 'yup';
import {useResetPassword} from 'hooks/useResetPassword';
import {PasswordRequest} from './PasswordRequest';
import {PasswordReset} from './PasswordReset';

export const ResetPassword = () => {
  const {t} = useTranslation();
  const {search} = useLocation();

  const {type} = queryString.parse(search);

  const [email, setEmail] = useState<string>('');

  const {request, reset, loading} = useResetPassword();

  const requestValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('Enter a valid email'))
      .required(t('Email is required')),
  });

  const requestForm = useFormik({
    initialValues: {
      email: localStorage.getItem('email') || '',
    },
    onSubmit: (values) => {
      setEmail(values.email);
      request(values.email, true);
    },
    validationSchema: requestValidationSchema,
  });

  const resetValidationSchema = Yup.object().shape({
    token: Yup.string()
      .min(6, t('Reset code must be at least 6 characters'))
      .max(6, t('Reset code must be at most 6 characters'))
      .required(t('Reset code is required')),
    password: Yup.string()
      .required(t('This field is required'))
      .min(6, t('Must be at least 6 characters'))
      .matches(/\d/, t('Must contain 1 digit'))
      .matches(/[!@#$%^&*(),.?":{}|<>_]/g, t('Must contain 1 symbol')),
    confirmPassword: Yup.string()
      .required(t('This field is required'))
      .oneOf([Yup.ref('password')], t('Passwords must match')),
  });

  const resetForm = useFormik({
    initialValues: {
      token: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: (values) => {
      reset(values.token, values.password, email);
    },
    validationSchema: resetValidationSchema,
  });

  return type === 'reset' ? (
    <PasswordReset
      handleChange={resetForm.handleChange}
      handleSubmit={resetForm.handleSubmit}
      handleBlur={resetForm.handleBlur}
      token={resetForm.values.token}
      tokenError={resetForm.errors.token}
      tokenTouched={resetForm.touched.token}
      password={resetForm.values.password}
      passwordError={resetForm.errors.password}
      passwordTouched={resetForm.touched.password}
      confirmPassword={resetForm.values.confirmPassword}
      confirmPasswordError={resetForm.errors.confirmPassword}
      confirmPasswordTouched={resetForm.touched.confirmPassword}
      email={email}
      loading={loading}
    />
  ) : (
    <PasswordRequest
      handleChange={requestForm.handleChange}
      handleSubmit={requestForm.handleSubmit}
      handleBlur={requestForm.handleBlur}
      email={requestForm.values.email}
      emailError={requestForm.errors.email}
      emailTouched={requestForm.touched.email}
      loading={loading}
    />
  );
};

export default ResetPassword;
