import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  height?: string | number;
}

export const Progress = ({height, ...rest}: Props) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: height || '70vh',
    }}
    {...rest}>
    <CircularProgress />
  </Box>
);
