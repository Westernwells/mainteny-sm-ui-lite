import {SxProps, Theme} from '@mui/system';
import Box from '@mui/material/Box';
import {ReactNode} from 'react';

interface Props {
  children: ReactNode;
  containerStyle?: SxProps<Theme>;
}

export const FlexContainer = ({children, containerStyle}: Props) => (
  <Box
    sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      ...containerStyle,
    }}>
    {children}
  </Box>
);
