import {ReactNode} from 'react';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  children?: ReactNode;
  label?: string;
}

export const ScheduleHeader = ({children, label, ...rest}: Props) => (
  <Box {...rest} component="thead">
    {label || children || null}
  </Box>
);
