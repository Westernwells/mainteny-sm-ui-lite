import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import ArrowForward from '@mui/icons-material/ArrowForward';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import EmailSharp from '@mui/icons-material/EmailSharp';
import CircularProgress from '@mui/material/CircularProgress';

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
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <form style={{width: '18rem'}} onSubmit={handleSubmit}>
        <TextField
          sx={{}}
          id="email"
          name="email"
          label="Email address"
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
            label="Password"
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
                variant="text"
                color="info"
                sx={{textTransform: 'capitalize'}}>
                Forgot Password?
              </Button>
            </Link>
          </Box>
        </Box>

        <Button
          type="submit"
          disabled={
            !!(!password || !email || emailError || passwordError || loading)
          }
          sx={{marginTop: 5, width: '100%'}}
          variant="contained"
          size="large"
          endIcon={
            loading ? (
              <CircularProgress size={20} sx={{color: 'gray'}} />
            ) : (
              <ArrowForward />
            )
          }>
          Login
        </Button>
      </form>
    </Box>
  );
};
