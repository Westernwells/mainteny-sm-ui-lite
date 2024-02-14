import {AutoAwesome} from '@mui/icons-material';
import {Popper, Paper, MenuItem, Typography, PopperProps} from '@mui/material';
import {Box} from '@mui/system';
import {theme} from 'theme';
import {T} from 'utils/i18n-utils';

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
                {T('Generate ID')}
              </Typography>
            </Box>

            <Typography variant="body2" color={theme.palette.text.secondary}>
              {T('Customizable in Settings')}
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
                {T('Enable Automatic ID Generation')}
              </Typography>
            </Box>

            <Typography variant="body2" color={theme.palette.text.secondary}>
              {T('Allows for easier number input')}
            </Typography>
          </MenuItem>
        )}
      </Paper>
    </Popper>
  );
};

export default CustomPopper;
