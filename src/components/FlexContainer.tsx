import Box from '@mui/material/Box';
import {ReactNode} from 'react';

interface Props {
  children: ReactNode;
  containerStyle?: {[key: string]: any};
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
