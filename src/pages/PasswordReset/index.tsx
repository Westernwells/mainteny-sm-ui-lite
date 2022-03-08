import Typography from '@mui/material/Typography';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PasswordRequestForm} from './PasswordRequestForm';
import {PasswordAuthenticateForm} from './PasswordAuthenticateForm';
import {PasswordResetForm} from './PasswordResetForm';
import {AuthLayout} from '../../components/AuthLayout';

const requestValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
});

export const PasswordRequest = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: (values) => {
      navigate('/reset-password/authenticate');
      console.log(values);
    },
    validationSchema: requestValidationSchema,
  });

  return (
    <AuthLayout>
      <Typography variant="h5" mt={7} textAlign="center">
        Forgot Password
      </Typography>
      <PasswordRequestForm
        handleChange={formik.handleChange}
        handleSubmit={formik.handleSubmit}
        handleBlur={formik.handleBlur}
        email={formik.values.email}
        emailError={formik.errors.email}
        emailTouched={formik.touched.email}
      />
    </AuthLayout>
  );
};

const authValidationSchema = Yup.object().shape({
  pin: Yup.string()
    .min(6, 'Reset code must be at least 6 characters')
    .max(6, 'Reset code must be at most 6 characters')
    .required('Pin is required'),
});

export const PasswordAuthenticate = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      pin: '',
    },
    onSubmit: (values) => {
      navigate('/reset-password/reset');
      console.log(values);
    },
    validationSchema: authValidationSchema,
  });

  return (
    <AuthLayout>
      <Typography variant="h5" mt={7} textAlign="center">
        Forgot Password
      </Typography>
      <PasswordAuthenticateForm
        handleChange={formik.handleChange}
        handleSubmit={formik.handleSubmit}
        handleBlur={formik.handleBlur}
        pin={formik.values.pin}
        pinError={formik.errors.pin}
        pinTouched={formik.touched.pin}
      />
    </AuthLayout>
  );
};

const resetValidationSchema = Yup.object().shape({
  password: Yup.string()
    .required('field is required')
    .min(6, 'must be atleast 6 characters')
    .matches(/\d/, 'must contain 1 digit'),
});

export const PasswordReset = () => {
  const [heading, setHeading] = useState('Set a new password');
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: (values) => {
      console.log(values);
    },
    validationSchema: resetValidationSchema,
  });

  return (
    <AuthLayout>
      <Typography variant="h5" my={7} textAlign="center">
        {heading}
      </Typography>
      <PasswordResetForm
        handleChange={formik.handleChange}
        handleSubmit={formik.handleSubmit}
        password={formik.values.password}
        passwordError={formik.errors.password}
        handleBlur={formik.handleBlur}
        confirmPassword={formik.values.confirmPassword}
        setHeading={setHeading}
      />
    </AuthLayout>
  );
};