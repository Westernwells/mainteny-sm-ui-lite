import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import ArrowForward from '@mui/icons-material/ArrowForward';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import EmailSharp from '@mui/icons-material/EmailSharp';
import CircularProgress from '@mui/material/CircularProgress';
import {Button} from 'components/Button';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  email: string;
  emailTouched: boolean | undefined;
  emailError: string | undefined;
  password: string;
  passwordError: string | undefined;
  loading: boolean;
}

export const LoginForm = ({
  handleSubmit,
  handleChange,
  password,
  passwordError,
  email,
  emailError,
  handleBlur,
  emailTouched,
  loading,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const {t} = useTranslation();
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <form style={{width: '18rem'}} onSubmit={handleSubmit}>
        <TextField
          sx={{}}
          id="email"
          name="email"
          label={t('Email address')}
          size="medium"
          fullWidth
          type="email"
          error={!!(emailTouched && emailError)}
          helperText={emailTouched && emailError ? emailError : ''}
          onChange={handleChange}
          onBlur={handleBlur}
          value={email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailSharp />
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <TextField
            sx={{marginTop: 4}}
            id="password"
            name="password"
            label={t('Password')}
            size="medium"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            onChange={handleChange}
            onBlur={handleBlur}
            value={password}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{cursor: 'pointer'}}>
                  <RemoveRedEye />
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Link to="/recover" style={{textDecoration: 'none'}}>
              <Button
                label={t('Forgot Password?')}
                buttonProps={{
                  sx: {color: 'text.secondary', textTransform: 'capitalize'},
                  color: 'info',
                }}
              />
            </Link>
          </Box>
        </Box>

        <Button
          label={t('Login')}
          buttonProps={{
            sx: {marginTop: 5, width: '100%'},
            size: 'large',
            type: 'submit',
            variant: 'contained',
            disabled: !!(
              !password ||
              !email ||
              emailError ||
              passwordError ||
              loading
            ),
            endIcon: loading ? (
              <CircularProgress size={20} sx={{color: 'gray'}} />
            ) : (
              <ArrowForward />
            ),
          }}
        />
      </form>
    </Box>
  );
};
