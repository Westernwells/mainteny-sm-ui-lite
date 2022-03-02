import React, {useState} from 'react';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom';

interface Props {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  password: string;
  passwordError: string | undefined;
  confirmPassword: string;
}

export const PasswordResetForm = ({
  handleSubmit,
  handleChange,
  password,
  passwordError,
  confirmPassword,
  handleBlur,
}: Props) => {
  const [reEnterPassword, setReEnterPassword] = useState(false);
  const navigate = useNavigate();
  return (
    <Box mt={3} display="flex" justifyContent="center" width="100%">
      <form style={{width: '18rem'}} onSubmit={handleSubmit}>
        <TextField
          disabled={reEnterPassword}
          id="password"
          name="password"
          label="Password"
          size="medium"
          fullWidth
          type="password"
          onChange={handleChange}
          onBlur={handleBlur}
          value={password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
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
                  password.length >= 6 ? 'body1' : 'rgba(143, 155, 179, 0.5)'
                }
              >
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
                  password.match(/\d/) ? 'body1' : 'rgba(143, 155, 179, 0.5)'
                }
              >
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
            type="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
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
            onClick={() => setReEnterPassword(!reEnterPassword)}
            size="large"
            endIcon={<ArrowForward />}
          >
            Next
          </Button>
        ) : (
          <Box mt={5}>
            <Button
              disabled={!!(!password || passwordError)}
              sx={{width: '100%'}}
              variant="contained"
              size="large"
              onClick={() => navigate('/login?authType=reset')}
              endIcon={<ArrowForward />}
            >
              Go
            </Button>
            <Button
              sx={{width: '100%', marginTop: 1}}
              variant="outlined"
              onClick={() => setReEnterPassword(!reEnterPassword)}
              size="large"
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
          </Box>
        )}
      </form>
    </Box>
  );
};
