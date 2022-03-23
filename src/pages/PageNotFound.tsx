import {Button, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {ReactComponent as TechnicianIllustration} from 'assets/illustrations/technician.svg';
import {useNavigate} from 'react-router';

export const PageNotFound = () => {
  const message1 = `Sorry, this page doesn't exist 😟`;
  const message2 = `Kindly check the URL for any misspell
  or click the button below to go to our home page 🤗`;
  const navigate = useNavigate();
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      px="10%">
      <TechnicianIllustration />
      <Typography variant="h4" textAlign="center" mt={6}>
        {message1}
      </Typography>
      <Typography variant="h4" textAlign="center">
        {message2}
      </Typography>
      <Box mt={6}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/', {replace: true})}>
          Home
        </Button>
      </Box>
    </Box>
  );
};
