import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import {useResetPassword} from 'hooks/useResetPassword';
import {AuthLayout} from 'components/AuthLayout';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  token: string;
  tokenError: string | undefined;
  tokenTouched: boolean | undefined;
  password: string;
  passwordError: string | undefined;
  passwordTouched: boolean | undefined;
  confirmPassword: string;
  confirmPasswordError: string | undefined;
  confirmPasswordTouched: boolean | undefined;
  email: string;
  loading: boolean;
}

export const PasswordReset = ({
  handleSubmit,
  handleChange,
  handleBlur,
  token,
  tokenError,
  tokenTouched,
  password,
  passwordError,
  passwordTouched,
  confirmPassword,
  confirmPasswordError,
  confirmPasswordTouched,
  email,
  loading,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const [reEnterPassword, setReEnterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [heading, setHeading] = useState(t('Forgot Password'));
  const [swap, setSwap] = useState<Boolean>(false);
  const {request} = useResetPassword();
  const handleSwap = (value: Boolean, option: number) => {
    setSwap(value);
    switch (option) {
      case 1:
        setHeading(t('Set a new password'));
        break;
      case 2:
        setHeading(t('Confirm new password'));
        break;
      default:
        setHeading(t('Forgot Password'));
    }
  };
  return (
    <AuthLayout>
      <Typography variant="h5" mt={7} textAlign="center">
        {heading}
      </Typography>
      <Box mt={3} display="flex" justifyContent="center" width="100%">
        <form style={{width: 'min(18rem, 100%)'}} onSubmit={handleSubmit}>
          {!swap ? (
            <>
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                my={4}>
                {t(
                  'Please enter the reset code we sent to your email address.',
                )}
              </Typography>

              <TextField
                id="token"
                name="token"
                size="medium"
                fullWidth
                type="text"
                error={!!(tokenTouched && tokenError)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={token}
                helperText={tokenError}
              />

              <Box mt={5}>
                <Button
                  onClick={() => handleSwap(true, 1)}
                  disabled={!!(!token || tokenError)}
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
                  {t('Reset password')}
                </Button>
                <Button
                  sx={{width: '100%', marginTop: 1}}
                  variant="text"
                  onClick={() => navigate('/reset-password')}
                  size="large"
                  startIcon={<ArrowBack />}>
                  {t('Back')}
                </Button>
                <Typography color="text.secondary" textAlign="center" mt={5}>
                  {`${t("Didn't receive the code?")} `}
                  <Typography
                    color="secondary.dark"
                    component="span"
                    onClick={() => request(email)}
                    sx={{cursor: 'pointer'}}>
                    {t('Resend')}
                  </Typography>
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <TextField
                disabled={reEnterPassword}
                id="password"
                name="password"
                label={t('Password')}
                size="medium"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                error={!!(passwordTouched && passwordError)}
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
              {!reEnterPassword ? (
                <>
                  <Box mt={1} display="flex">
                    <CheckCircleRounded
                      color={password.length >= 8 ? 'success' : 'disabled'}
                    />
                    <Typography
                      variant="body1"
                      ml={1}
                      color={password.length >= 8 ? 'body1' : 'text.disabled'}>
                      {t('Password should contain at least 8 characters')}
                    </Typography>
                  </Box>

                  <Box mt={1} display="flex">
                    <CheckCircleRounded
                      color={password.match(/\d/) ? 'success' : 'disabled'}
                    />
                    <Typography
                      variant="body1"
                      ml={1}
                      color={password.match(/\d/) ? 'body1' : 'text.disabled'}>
                      {t('Password should contain at least 1 number')}
                    </Typography>
                  </Box>

                  <Box mt={1} display="flex">
                    <CheckCircleRounded
                      color={
                        password.match(/[!@#$%^&*(),.?":{}|<>_]/g)
                          ? 'success'
                          : 'disabled'
                      }
                    />
                    <Typography
                      variant="body1"
                      ml={1}
                      color={
                        password.match(/[!@#$%^&*(),.?":{}|<>_]/g)
                          ? 'body1'
                          : 'text.disabled'
                      }>
                      {t('Password should contain at least 1 symbol')}
                    </Typography>
                  </Box>
                </>
              ) : (
                <TextField
                  sx={{marginTop: 4}}
                  id="confirmPassword"
                  name="confirmPassword"
                  label={t('Re-enter password')}
                  size="medium"
                  fullWidth
                  error={!!(confirmPasswordTouched && confirmPasswordError)}
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={confirmPassword}
                  helperText={confirmPasswordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        sx={{cursor: 'pointer'}}>
                        <RemoveRedEye />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              {!reEnterPassword ? (
                <Button
                  disabled={!!(!password || passwordError)}
                  sx={{marginTop: 5, width: '100%'}}
                  variant="contained"
                  onClick={() => {
                    setReEnterPassword(!reEnterPassword);
                    handleSwap(swap, 2);
                  }}
                  size="large"
                  endIcon={<ArrowForward />}>
                  {t('Next')}
                </Button>
              ) : (
                <Box mt={5}>
                  <Button
                    type="submit"
                    disabled={
                      !!(confirmPasswordTouched && confirmPasswordError)
                    }
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
                    {t('Go')}
                  </Button>
                  <Button
                    sx={{width: '100%', marginTop: 1}}
                    variant="outlined"
                    onClick={() => {
                      setReEnterPassword(!reEnterPassword);
                      handleSwap(swap, 1);
                    }}
                    size="large"
                    startIcon={<ArrowBack />}>
                    {t('Back')}
                  </Button>
                </Box>
              )}
              <Typography color="text.secondary" textAlign="center" mt={5}>
                {`${t("Didn't receive the code?")} `}
                <Typography
                  color="secondary.dark"
                  component="span"
                  onClick={() => {
                    request(email, true);
                    handleSwap(false, 3);
                  }}
                  sx={{cursor: 'pointer'}}>
                  {t('Resend')}
                </Typography>
              </Typography>
            </>
          )}
        </form>
      </Box>
    </AuthLayout>
  );
};
