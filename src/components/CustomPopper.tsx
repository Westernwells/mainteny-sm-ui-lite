// @ts-nocheck
import {AutoAwesome} from '@mui/icons-material';
import {Popper, Paper, MenuItem, Typography, PopperProps} from '@mui/material';
import {Box} from '@mui/system';
import {t} from 'i18next';
import {theme} from 'theme';

const CustomPopper = (
  props: PopperProps & {isEnabled?: boolean; handleAction: any; query: string},
) => {
  const {isEnabled, handleAction, ...popperProps} = props;

  const handleClick = () => {
    if (handleAction) {
      handleAction();
    }
  };

  return (
    <Popper {...popperProps}>
      <Paper sx={{backgroundColor: 'white', zIndex: 0}}>
        {isEnabled ? (
          <MenuItem
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              padding: '1em 2.5em',
            }}
            onMouseDown={handleClick}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                paddingBottom: '0.6em',
              }}>
              <AutoAwesome />
              <Typography variant="subtitle2" sx={{paddingLeft: '0.5em'}}>
                {t('Generate ID')}
              </Typography>
            </Box>

            <Typography variant="body2" color={theme.palette.text.secondary}>
              {t('Customizable in Settings')}
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              padding: '1em 2.5em',
            }}
            onMouseDown={handleClick}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: '0.6em',
              }}>
              <AutoAwesome />
              <Typography variant="subtitle2" sx={{paddingLeft: '0.5em'}}>
                {t('Enable Automatic ID Generation')}
              </Typography>
            </Box>

            <Typography variant="body2" color={theme.palette.text.secondary}>
              {t('Allows for easier number input')}
            </Typography>
          </MenuItem>
        )}
      </Paper>
    </Popper>
  );
};

export default CustomPopper;
