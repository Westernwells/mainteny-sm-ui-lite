import Box from '@mui/material/Box';
import {ReactNode} from 'react';

interface Props {
  children?: ReactNode;
  label?: string;
}

export const ScheduleBodyCell = ({label, children, ...rest}: Props) => (
  <Box
    component="td"
    sx={{
      outline: '1px solid #dddddd',
      textAlign: 'left',
      height: '70px',
      paddingBlock: '8px',
      paddingInline: 0,
      maxWidth: '120px',
      minWidth: '120px',
    }}
    {...rest}>
    {label || children || null}
  </Box>
);
