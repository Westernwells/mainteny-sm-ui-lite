import {ReactNode} from 'react';
import Box from '@mui/material/Box';

interface Props {
  children?: ReactNode;
  label?: string;
}

export const ScheduleBody = ({children, label, ...rest}: Props) => (
  <Box component="tbody" {...rest}>
    {label || children || null}
  </Box>
);
