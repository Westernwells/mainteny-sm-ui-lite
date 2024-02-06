import {SxProps} from '@mui/system';
import {theme} from 'theme';

export const styles = {
  scrollBar: theme.unstable_sx({
    '& ::-webkit-scrollbar': {
      width: '6rem',
    },
    '& ::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '& ::-webkit-scrollbar-thumb': {
      background: 'yellow',
      borderRadius: '6rem',
    },
  }) as SxProps,
};
