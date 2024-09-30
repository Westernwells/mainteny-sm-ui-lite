import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {t} from 'i18next';
import {Box, Snackbar, Typography} from '@mui/material';
import {RefreshOutlined} from '@mui/icons-material';
import {ReactComponent as MaintenyLogo} from 'assets/icons/Logo.svg';
import {Button} from 'components/Button';
import {handleHardReload} from 'utils/utils';

export const UpdateSnackbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let bodyObserver: MutationObserver | null = null;

    // Function to check the presence of the BottomDrawer in the DOM
    const checkDrawer = () => {
      // Select the BottomDrawer using its data-testid attribute
      const drawer = document.querySelector('[data-testid="bottom-drawer"]');

      if (drawer) {
        setDrawerOpen(true);
      } else {
        setDrawerOpen(false);
      }
    };

    // Perform an initial check when the component mounts or the route changes
    checkDrawer();

    // If a bodyObserver hasn't been set up yet, create one
    if (!bodyObserver) {
      bodyObserver = new MutationObserver(checkDrawer);

      // Observe the entire body for additions or removals of child elements
      // This helps detect when the BottomDrawer is added to or removed from the DOM
      bodyObserver.observe(document.body, {childList: true, subtree: true});
    }

    // Cleanup function to disconnect observers when the component unmounts
    // or before the effect runs again (e.g., on route change)
    return () => {
      if (bodyObserver) bodyObserver.disconnect();
    };
  }, [location]); // Re-run the effect whenever the route changes

  return (
    <Snackbar
      open
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      // Adjust the bottom margin based on whether the BottomDrawer is present
      sx={{mb: drawerOpen ? 10 : 0}}>
      <Box
        bgcolor="primary.dark"
        color="white"
        boxShadow={10}
        p={2}
        borderRadius={2}
        maxWidth={400}
        display="flex"
        gap={2}>
        <MaintenyLogo width={80} height={40} />

        <Box>
          <Typography variant="subtitle2">
            {t('Mainteny platform update')}
          </Typography>

          <Typography variant="body2" color="text.secondary" pt={0.5}>
            {t(
              'An improved version of Mainteny is available, please refresh your browser to upgrade.',
            )}
          </Typography>

          <Button
            label="Refresh and update"
            buttonProps={{
              onClick: handleHardReload,
              variant: 'outlined',
              sx: {
                bgcolor: 'transparent',
                color: 'white',
                typography: 'subtitle2',
                borderColor: 'text.secondary',
                mt: 2,
                '&:hover': {
                  color: 'text.secondary',
                  borderColor: 'primary.main',
                },
              },
              size: 'small',
              startIcon: <RefreshOutlined sx={{color: 'inherit', mb: 0.5}} />,
            }}
          />
        </Box>
      </Box>
    </Snackbar>
  );
};
