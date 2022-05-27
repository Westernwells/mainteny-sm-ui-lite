import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {ReactComponent as TechnicianIllustration} from 'assets/illustrations/technician.svg';
import {Button} from 'components/Button';
import {useNavigate} from 'react-router';

export const PageNotFound = () => {
  const message1 = `Sorry, this page doesn't exist 😟`;
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
      <Box mt={6}>
        <Button
          label="Home"
          buttonProps={{
            variant: 'contained',
            size: 'large',
            onClick: () => navigate('/', {replace: true}),
          }}
        />
      </Box>
    </Box>
  );
};
