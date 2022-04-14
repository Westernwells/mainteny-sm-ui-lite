import React, {ReactNode} from 'react';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  children: ReactNode;
}

export const ScheduleRow = ({children, ...rest}: Props) => (
  <Box {...rest} component="tr">
    {children}
  </Box>
);
