import React, {ReactNode} from 'react';
import Box from '@mui/material/Box';

interface Props {
  children: ReactNode;
}

export const ScheduleRow = ({children, ...rest}: Props) => (
  <Box {...rest} component="tr">
    {children}
  </Box>
);
