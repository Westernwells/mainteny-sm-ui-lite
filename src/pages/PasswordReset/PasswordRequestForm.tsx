import React from 'react';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom';
import {Button} from 'components/Button';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  email: string;
  emailError: string | undefined;
  emailTouched: boolean | undefined;
}

export const PasswordRequestForm = ({
  handleSubmit,
  handleChange,
  handleBlur,
  email,
  emailError,
  emailTouched,
}: Props) => {
  const navigate = useNavigate();
  return (
    <Box mt={3} display="flex" justifyContent="center" width="100%">
      <form style={{width: '18rem'}} onSubmit={handleSubmit}>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          my={4}>
          We’ll send a password reset code to the below email address
        </Typography>
        <TextField
          id="email"
          name="email"
          label="Email address"
          size="medium"
          fullWidth
          type="email"
          error={!!(emailTouched && emailError)}
          onChange={handleChange}
          onBlur={handleBlur}
          value={email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box mt={5}>
          <Button
            label="Get Reset Code"
            buttonProps={{
              type: 'submit',
              disabled: !!(!email || emailError),
              sx: {width: '100%'},
              variant: 'contained',
              size: 'large',
              endIcon: <ArrowForward />,
            }}
          />

          <Button
            label="Back"
            buttonProps={{
              sx: {width: '100%'},
              onClick: () => navigate('/login'),
              size: 'large',
              startIcon: <ArrowBack />,
            }}
          />
        </Box>
      </form>
    </Box>
  );
};
