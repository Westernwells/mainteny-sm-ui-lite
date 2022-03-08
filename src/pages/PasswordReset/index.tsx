import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {PasswordRequestForm} from './PasswordRequestForm';
import {PasswordAuthenticateForm} from './PasswordAuthenticateForm';
import {PasswordResetForm} from './PasswordResetForm';
import {ReactComponent as CheckMark} from '../../assets/icons/CheckMark.svg';
import {AuthLayout} from '../../components/AuthLayout';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('field is required')
    .min(6, 'must be atleast 6 characters')
    .matches(/\d/, 'must contain 1 digit'),
});

const requestValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
});

export const PasswordRequest = () => {
  const formik = useFormik({
    initialValues: {
      email: 'aa@aa.co',
    },
    onSubmit: (values) => {
      console.log(values);
    },
    validationSchema: requestValidationSchema,
  });

  return (
    <AuthLayout>
      <Box display="flex" justifyContent="center">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          mr={2}
        >
          {/* <CheckMark /> */}
        </Box>
        <Typography variant="h5" mt={7} textAlign="center">
          Forgot Password
        </Typography>
      </Box>

      {/* <Typography variant="h6" mt={5} textAlign="center">
        Set a new password
      </Typography> */}

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

export const PasswordAuthenticate = () => {
  const formik = useFormik({
    initialValues: {
      pin: '',
    },
    onSubmit: (values) => {
      console.log(values);
    },
    validationSchema,
  });

  return (
    <AuthLayout>
      <Box display="flex" justifyContent="center">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          mr={2}
        >
          {/* <CheckMark /> */}
        </Box>
        <Typography variant="h5" mt={7} textAlign="center">
          Forgot Password
        </Typography>
      </Box>

      {/* <Typography variant="h6" mt={5} textAlign="center">
        Set a new password
      </Typography> */}

      <PasswordAuthenticateForm
        handleChange={formik.handleChange}
        handleSubmit={formik.handleSubmit}
        handleBlur={formik.handleBlur}
        pin={formik.values.pin}
      />
    </AuthLayout>
  );
};

export const PasswordReset = () => {
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: (values) => {
      console.log(values);
    },
    validationSchema,
  });

  return (
    <AuthLayout>
      <Box display="flex" justifyContent="center">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          mr={2}
        >
          {/* <CheckMark /> */}
        </Box>
        <Typography variant="h5" mt={7} textAlign="center">
          Forgot Password
        </Typography>
      </Box>

      {/* <Typography variant="h6" mt={5} textAlign="center">
        Set a new password
      </Typography> */}

      <PasswordResetForm
        handleChange={formik.handleChange}
        handleSubmit={formik.handleSubmit}
        password={formik.values.password}
        passwordError={formik.errors.password}
        handleBlur={formik.handleBlur}
        confirmPassword={formik.values.confirmPassword}
      />
    </AuthLayout>
  );
};
