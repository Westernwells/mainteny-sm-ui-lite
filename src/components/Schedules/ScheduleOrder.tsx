import Box from '@mui/material/Box';
import {ReactNode} from 'react';

interface Props {
  children?: ReactNode;
  label?: string;
  width?: string;
  marginLeft?: string;
}

export const ScheduleOrder = ({
  children,
  label,
  width,
  marginLeft,
  ...rest
}: Props) => (
  <Box
    {...rest}
    component="div"
    sx={{
      position: 'absolute',
      height: '40px',
      top: '-15px',
      border: '1px solid red',
      overflowX: 'hidden',
      width,
      marginLeft,
    }}>
    {label || children || null}
  </Box>
);

export default ScheduleOrder;
