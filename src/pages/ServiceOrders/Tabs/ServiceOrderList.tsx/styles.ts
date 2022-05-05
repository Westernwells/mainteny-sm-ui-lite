// import {experimental_sx as sx} from '@mui/system';
import {theme} from 'theme';

export const olStyles = {
  orderStatus: {
    '& .MuiChip-label': {
      px: '0.5em',
    },
    [theme.breakpoints.down('md')]: {
      width: '5rem',
      fontSize: '0.6rem',
    },
    [theme.breakpoints.up('md')]: {
      width: '6.5rem',
      fontSize: '0.7rem',
    },
    [theme.breakpoints.up('lg')]: {
      width: '7rem',
      fontSize: '0.8125rem',
    },
  },
};
