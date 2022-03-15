import React from 'react';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  pin: string;
}

export const PasswordAuthenticateForm = ({
  handleSubmit,
  handleChange,
  handleBlur,
  pin,
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
          Please enter the reset code we sent to your email address.
        </Typography>

        <TextField
          id="pin"
          name="pin"
          size="medium"
          fullWidth
          type="text"
          onChange={handleChange}
          onBlur={handleBlur}
          value={pin}
        />

        <Box mt={5}>
          <Button
            disabled={!pin}
            sx={{width: '100%'}}
            variant="contained"
            size="large"
            onClick={() => navigate('/reset-password/reset')}
            endIcon={<ArrowForward />}>
            Reset Password
          </Button>
          <Button
            sx={{width: '100%', marginTop: 1}}
            variant="text"
            onClick={() => console.log('Back')}
            size="large"
            startIcon={<ArrowBack />}>
            Back
          </Button>
          <p>Did not receive code? Resend</p>
        </Box>
      </form>
    </Box>
  );
};
