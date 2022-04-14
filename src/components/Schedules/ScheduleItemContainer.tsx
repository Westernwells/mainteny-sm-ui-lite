import Box from '@mui/material/Box';
import {ReactNode} from 'react';

interface Props {
  children?: ReactNode;
  label?: string;
}

export const ScheduleItemContainer = ({children, label, ...rest}: Props) => (
  <Box {...rest} component="div" sx={{position: 'relative'}}>
    {label || children || null}
  </Box>
);
