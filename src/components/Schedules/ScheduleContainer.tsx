import {forwardRef, ReactNode} from 'react';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  children: ReactNode;
}

export const ScheduleContainer = forwardRef<
  HTMLInputElement | undefined,
  Props
>(({children, ...rest}, ref) => (
  <Box
    ref={ref}
    component="table"
    sx={{
      borderCollapse: 'separate',
      borderSpacing: 0,
      position: 'relative',
    }}
    {...rest}>
    {children}
  </Box>
));
