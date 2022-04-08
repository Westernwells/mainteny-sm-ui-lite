import {ReactNode} from 'react';
import Box from '@mui/material/Box';

interface Props {
  children?: ReactNode;
  label?: string;
}

export const ScheduleHeader = ({children, label, ...rest}: Props) => (
  <Box {...rest} component="thead">
    {label || children || null}
  </Box>
);
