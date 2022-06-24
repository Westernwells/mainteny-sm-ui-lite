import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useFormik} from 'formik';
import {useLocation} from 'react-router-dom';
import queryString from 'query-string';
import * as Yup from 'yup';
import {ReactComponent as CheckMark} from 'assets/icons/CheckMark.svg';
import {useAuth} from 'hooks/useAuth';
import {AuthLayout} from 'components/AuthLayout';
import {LoginForm} from './components/LoginForm';

export const Login = () => {
  const {search} = useLocation();
  const {t} = useTranslation();
  const {authType} = queryString.parse(search);
  const {signin, loading} = useAuth();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('Enter a valid email'))
      .required(t('Email is required')),
    password: Yup.string().required(t('field is required')),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      email: localStorage.getItem('email') || '',
    },
    onSubmit: (values) => {
      localStorage.setItem('email', values.email);
      signin(values.email, values.password);
    },
    validationSchema,
  });

  return (
    <AuthLayout>
      {authType === 'reset' ? (
        <Box display="flex" justifyContent="center">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            mr={2}>
            <CheckMark />
          </Box>
          <Typography variant="h4" mt={7}>
            {t('Password created successfully')}
          </Typography>
        </Box>
      ) : null}

      <Typography variant="h6" mt={5} mb="2.5rem" textAlign="center">
        {t('Login')}
      </Typography>

      <LoginForm
        handleChange={formik.handleChange}
        handleSubmit={formik.handleSubmit}
        password={formik.values.password}
        passwordError={formik.errors.password}
        handleBlur={formik.handleBlur}
        email={formik.values.email}
        emailError={formik.errors.email}
        emailTouched={formik.touched.email}
        loading={loading}
      />
    </AuthLayout>
  );
};
