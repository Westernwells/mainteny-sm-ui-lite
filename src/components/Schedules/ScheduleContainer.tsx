import {ReactNode} from 'react';
import Box from '@mui/material/Box';

interface Props {
  children: ReactNode;
}

export const ScheduleContainer = ({children, ...rest}: Props) => (
  <Box
    component="table"
    sx={{
      borderCollapse: 'separate',
      borderSpacing: 0,
      width: '400px',
    }}
    {...rest}>
    {children}
  </Box>
);
