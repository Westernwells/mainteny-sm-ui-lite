import React from 'react';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {Link, useNavigate} from 'react-router-dom';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  pin: string;
  pinError: string | undefined;
  pinTouched: boolean | undefined;
}

export const PasswordAuthenticateForm = ({
  handleSubmit,
  handleChange,
  handleBlur,
  pin,
  pinError,
  pinTouched,
}: Props) => {
  const navigate = useNavigate();
  return (
    <Box mt={3} display="flex" justifyContent="center" width="100%">
      <form style={{width: '18rem'}} onSubmit={handleSubmit}>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          my={4}
        >
          Please enter the reset code we sent to your email address.
        </Typography>

        <TextField
          id="pin"
          name="pin"
          size="medium"
          fullWidth
          type="text"
          error={!!(pinTouched && pinError)}
          onChange={handleChange}
          onBlur={handleBlur}
          value={pin}
          helperText={pinError}
        />

        <Box mt={5}>
          <Button
            type="submit"
            disabled={!!(!pin || pinError)}
            sx={{width: '100%'}}
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
          >
            Reset Password
          </Button>
          <Button
            sx={{width: '100%', marginTop: 1}}
            variant="text"
            onClick={() => navigate(-1)}
            size="large"
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Typography color="text.secondary" textAlign="center" mt={5}>
            Did not receive the code?
            <Link to="/reset-password" style={{textDecoration: 'none'}}>
              <Typography color="secondary.dark" component="span">
                {' '}
                Resend
              </Typography>
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};