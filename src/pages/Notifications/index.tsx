import {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';
import {BackAction} from 'components/BackAction';
import Fade from '@mui/material/Fade';
import {NotificationCard} from './NotificationCard';

export const Notifications = () => {
  const theme = useTheme();
  const [offset, setOffset] = useState(0);
  const [showFabIcon, setShowFabIcon] = useState(false);

  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, {passive: true});

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (offset > 20 && !showFabIcon) {
      setShowFabIcon(true);
    }

    if (offset < 20 && showFabIcon) {
      setShowFabIcon(false);
    }
  }, [offset]);

  return (
    <Box>
      <Box sx={{mb: 2}}>
        <Box pl="20vw">
          <BackAction label="Notifications" />
        </Box>

        <Box>
          <Typography
            variant="h6"
            color={theme.palette.text.secondary}
            px="20vw">
            Today (2)
          </Typography>
          <NotificationCard />
          <NotificationCard />
        </Box>

        <Box mt={3}>
          <Typography
            variant="h6"
            color={theme.palette.text.secondary}
            px="20vw">
            Yesterday (4)
          </Typography>
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
        </Box>

        <Box mt={3}>
          <Typography
            variant="h6"
            color={theme.palette.text.secondary}
            px="20vw">
            Earlier (55)
          </Typography>
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
          <NotificationCard />
        </Box>
      </Box>
      (
      <Fade in={showFabIcon}>
        <Box
          onClick={() => {
            window.scroll({top: 0, left: 0, behavior: 'smooth'});
          }}
          sx={{
            mt: 12,
            display: 'flex',
            height: '85vh',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            position: 'fixed',
            right: '1.5em',
            top: `calc(85vh*0.9)`,
          }}>
          <Fab color="primary" disableRipple>
            <NavigationIcon />
          </Fab>
        </Box>
      </Fade>
    </Box>
  );
};
