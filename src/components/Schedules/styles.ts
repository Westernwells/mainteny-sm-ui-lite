import {experimental_sx as sx} from '@mui/system';

export const styles = {
  card: sx({border: 'none', height: '100%'}),
  mainContainer: sx({
    overflow: 'scroll',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
  }),
  divider: sx({
    width: '1px',
    bgcolor: '#BDBDBD',
    opacity: 0.5,
    zIndex: 2,
  }),
  footerContainer: sx({
    position: 'sticky',
    left: 0,
    bottom: 0,
    zIndex: 5,
    background: '#fff',
    pt: '0.8em',
  }),
};
