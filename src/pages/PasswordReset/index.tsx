import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {PasswordResetForm} from './PasswordResetForm';
import {ReactComponent as CheckMark} from '../../assets/icons/CheckMark.svg';
import {AuthLayout} from '../../components/AuthLayout';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('field is required')
    .min(6, 'must be atleast 6 characters')
    .matches(/\d/, 'must contain 1 digit'),
});

export const PasswordReset = () => {
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: () => {
      // (values) => {}
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
          <CheckMark />
        </Box>
        <Typography variant="h4" mt={7} textAlign="center">
          Hi John, let’s activate your account
        </Typography>
      </Box>

      <Typography variant="h6" mt={5} textAlign="center">
        Set a new password
      </Typography>

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
