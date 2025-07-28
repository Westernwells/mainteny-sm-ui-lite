import {Box} from '@mui/system';
import {ReactNode} from 'react';
import {theme} from 'theme';

type Props = {
  children: ReactNode;
};

const ExtraOptionIconWrapper = ({children}: Props) => (
  <Box
    sx={{
      width: 27,
      height: 27,
      backgroundColor: theme.palette.inputBackground.main,
      borderRadius: 27 / 2,
      marginLeft: '2px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    {children}
  </Box>
);

export default ExtraOptionIconWrapper;
