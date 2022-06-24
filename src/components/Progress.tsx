import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box, {BoxProps} from '@mui/material/Box';
import {Typography} from '@mui/material';

interface Props extends BoxProps {
  height?: string | number;
  label?: string | null;
}

export const Progress = ({height, label = null, ...rest}: Props) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: height || '70vh',
    }}
    {...rest}>
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: label ? 'center' : 'unset',
        }}>
        <CircularProgress />
      </Box>
      <Typography sx={{}} variant="subtitle2">
        {label}
      </Typography>
    </Box>
  </Box>
);
