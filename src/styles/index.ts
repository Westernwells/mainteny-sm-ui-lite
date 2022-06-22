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

  scrollbar: {
    '&::-webkit-scrollbar': {
      height: '0.2em',
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '100vw',
      marginInline: '0.5em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '100vw',
      height: '1em',
    },
  },

  verticlaScrollBar: {
    '&::-webkit-scrollbar': {
      height: '0.2em',
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '100vw',
      marginInline: '0.5em',
    },
    '&::-webkit-scrollbar-thumb:vertical': {
      background: '#888',
      borderRadius: '100vw',
      height: '1em',
    },
  },
};
