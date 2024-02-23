import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {ReactComponent as NotFoundIllustration} from 'assets/illustrations/404.svg';
import {Button} from 'components/Button';
import {useNavigate} from 'react-router-dom';

export const PageNotFound = () => {
  const message1 = `Sorry, the page you are looking for doesn't exist!`;
  const navigate = useNavigate();

  return (
    <Box
      height="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      px="10%">
      <NotFoundIllustration />
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
          style={{width: '150px', height: '50px'}}
        />
      </Box>
    </Box>
  );
};

export default PageNotFound;
