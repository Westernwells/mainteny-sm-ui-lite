import React from 'react';
import {useTranslation} from 'react-i18next';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import {useNavigate} from 'react-router-dom';
import {AuthLayout} from 'components/AuthLayout';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  email: string;
  emailError: string | undefined;
  emailTouched: boolean | undefined;
  loading: boolean;
}

export const PasswordRequest = ({
  handleSubmit,
  handleChange,
  handleBlur,
  email,
  emailError,
  emailTouched,
  loading,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <Typography variant="h5" mt={7} textAlign="center">
        {t('Forgot Password')}
      </Typography>
      <Box mt={3} display="flex" justifyContent="center" width="100%">
        <Box
          component="form"
          style={{width: 'min(18rem, 100%)'}}
          onSubmit={handleSubmit}>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            my={4}>
            {t("We'll send a password reset code to the below email address")}
          </Typography>
          <TextField
            id="email"
            name="email"
            label={t('Email address')}
            size="medium"
            fullWidth
            type="email"
            error={!!(emailTouched && emailError)}
            onChange={handleChange}
            onBlur={handleBlur}
            value={email}
            placeholder={t('Enter your email address')}
          />
          <Box mt={5}>
            <Button
              type="submit"
              disabled={!!(!email || emailError)}
              sx={{width: '100%'}}
              variant="contained"
              size="large"
              endIcon={
                loading ? (
                  <CircularProgress size={20} sx={{color: 'gray'}} />
                ) : (
                  <ArrowForward />
                )
              }>
              {t('Send reset code')}
            </Button>
            <Button
              sx={{width: '100%', marginTop: 1}}
              variant="text"
              onClick={() => navigate('/login')}
              size="large"
              startIcon={<ArrowBack />}>
              {t('Back')}
            </Button>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};
