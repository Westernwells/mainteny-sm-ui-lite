import {ReactNode} from 'react';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  children: ReactNode;
}

export const ScheduleContainer = ({children, ...rest}: Props) => (
  <Box
    component="table"
    sx={{
      borderCollapse: 'separate',
      borderSpacing: 0,
    }}
    {...rest}>
    {children}
  </Box>
);
