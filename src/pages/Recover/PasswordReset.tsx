import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import {useRecoverPassword} from 'hooks/useRecoverPassword';
import {AuthLayout} from 'components/AuthLayout';
import {Button} from 'components/Button';

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
  const [reEnterPassword, setReEnterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [heading, setHeading] = useState('Forgot Password');
  const [swap, setSwap] = useState<Boolean>(false);
  const {request} = useRecoverPassword();
  const navigate = useNavigate();
  const handleSwap = (value: Boolean, option: number) => {
    setSwap(value);
    switch (option) {
      case 1:
        setHeading('Set a new password');
        break;
      case 2:
        setHeading('Confirm new password');
        break;
      default:
        setHeading('Forgot Password');
    }
  };
  return (
    <AuthLayout>
      <Typography variant="h5" mt={7} textAlign="center">
        {heading}
      </Typography>
      <Box mt={3} display="flex" justifyContent="center" width="100%">
        <form style={{width: '18rem'}} onSubmit={handleSubmit}>
          {!swap ? (
            <>
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                my={4}>
                Please enter the reset code we sent to your email address.
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
                  label="Reset Password"
                  buttonProps={{
                    onClick: () => handleSwap(true, 1),
                    disabled: !!(!token || tokenError),
                    sx: {width: '100%'},
                    variant: 'contained',
                    size: 'large',
                    endIcon: loading ? (
                      <CircularProgress size={20} sx={{color: 'gray'}} />
                    ) : (
                      <ArrowForward />
                    ),
                  }}
                />
                <Button
                  label="Back"
                  buttonProps={{
                    sx: {width: '100%', marginTop: 1},
                    onClick: () => navigate(-1),
                    size: 'large',
                    startIcon: <ArrowBack />,
                  }}
                />
                <Typography color="text.secondary" textAlign="center" mt={5}>
                  Did not receive the code?
                  <Typography
                    color="secondary.dark"
                    component="span"
                    onClick={() => request(email, true)}
                    sx={{cursor: 'pointer'}}>
                    {' '}
                    Resend
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
                label="Password"
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
                      color={password.length >= 6 ? 'success' : 'disabled'}
                    />
                    <Typography
                      variant="body1"
                      ml={1}
                      color={
                        password.length >= 6
                          ? 'body1'
                          : 'rgba(143, 155, 179, 0.5)'
                      }>
                      Atleast 6 characters
                    </Typography>
                  </Box>

                  <Box mt={1} display="flex">
                    <CheckCircleRounded
                      color={password.match(/\d/) ? 'success' : 'disabled'}
                    />
                    <Typography
                      variant="body1"
                      ml={1}
                      color={
                        password.match(/\d/)
                          ? 'body1'
                          : 'rgba(143, 155, 179, 0.5)'
                      }>
                      Minimum 1 number
                    </Typography>
                  </Box>
                </>
              ) : (
                <TextField
                  sx={{marginTop: 4}}
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Re enter password"
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
                  label="Next"
                  buttonProps={{
                    disabled: !!(!password || passwordError),
                    sx: {marginTop: 5, width: '100%'},
                    variant: 'contained',
                    onClick: () => {
                      setReEnterPassword(!reEnterPassword);
                      handleSwap(swap, 2);
                    },
                    size: 'large',
                    endIcon: <ArrowForward />,
                  }}
                />
              ) : (
                <Box mt={5}>
                  <Button
                    label="Go"
                    buttonProps={{
                      type: 'submit',
                      disabled: !!(
                        confirmPasswordTouched && confirmPasswordError
                      ),

                      sx: {width: '100%'},
                      variant: 'contained',
                      size: 'large',
                      endIcon: loading ? (
                        <CircularProgress size={20} sx={{color: 'gray'}} />
                      ) : (
                        <ArrowForward />
                      ),
                    }}
                  />
                  <Button
                    label="Back"
                    buttonProps={{
                      sx: {width: '100%', marginTop: 1},
                      variant: 'outlined',
                      onClick: () => {
                        setReEnterPassword(!reEnterPassword);
                        handleSwap(swap, 1);
                      },
                      size: 'large',
                      startIcon: <ArrowBack />,
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </form>
      </Box>
    </AuthLayout>
  );
};
