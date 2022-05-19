import {experimental_sx as sx} from '@mui/system';

export const styles = {
  scrollBar: sx({
    '& ::-webkit-scrollbar': {
      width: '0.25em',
    },
    '& ::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '& ::-webkit-scrollbar-thumb': {
      background: 'grey',
      borderRadius: '0.25em',
    },
  }),
};
