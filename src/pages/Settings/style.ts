// @ts-nocheck
import {SxProps} from '@mui/system';
import {theme} from 'theme';

export const styles = {
  scrollBar: theme.unstable_sx({
    '& ::-webkit-scrollbar': {
      width: '0.25em',
    },
    '& ::-webkit-scrollbar-track': {
      background: '#d9d8d8',
      borderRadius: '100vw',
    },
    '& ::-webkit-scrollbar-thumb': {
      background: 'grey',
      borderRadius: '0.25em',
    },
  }) as SxProps,
};
