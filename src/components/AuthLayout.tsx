import React from 'react';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import {ReactComponent as PolygonTop} from '../assets/icons/polygonTop.svg';
import {ReactComponent as PolygonBottom} from '../assets/icons/polygonBottom.svg';
import {ReactComponent as Logo} from '../assets/icons/Logo.svg';

interface Props {
  children: React.ReactNode;
}

const useStyles = makeStyles({
  leftBackground: {
    background: 'linear-gradient(180deg, #095369 0%, #043146 100%)',
  },
  leftContentText: {
    color: '#fff',
  },
});

export const AuthLayout = ({children}: Props) => {
  const classes = useStyles();

  return (
    <Box display="flex" height="100vh" sx={{backgroundColor: '#fff'}}>
      <Box
        className={classes.leftBackground}
        width="38vw"
        height="100%"
        position="relative"
        display="flex"
        pt="15rem"
        // alignItems="center"
      >
        <Box style={{position: 'absolute', top: 0, left: 0, right: 0}}>
          <PolygonTop width="100%" />
        </Box>

        <Box>
          <Box marginBottom="5rem">
            <Typography variant="h3" color="#fff" textAlign="center">
              {' '}
              Mainteny
            </Typography>
            <Typography color="#fff" variant="h5" textAlign="center">
              Service Manager Portal
            </Typography>
          </Box>
          <Typography
            color="textSecondary"
            variant="h6"
            width="100%"
            textAlign="center"
            paddingLeft={4}
            paddingRight={4}
          >
            The unified Application made for Service Managers with smart job
            assignments, real-time overview of Units under Maintenance (UuM) and
            out-of-the-box ERP Integrations!
          </Typography>
        </Box>
        <Box style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <PolygonBottom width="100%" />
        </Box>
      </Box>

      <Box display="flex" flexGrow={1} justifyContent="center" mt={23}>
        <Box>
          <Box display="flex" justifyContent="center">
            <Logo />
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
