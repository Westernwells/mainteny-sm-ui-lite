import {ReactNode} from 'react';
import Typography from '@mui/material/Typography';
import Box, {BoxProps} from '@mui/material/Box';

interface Props extends BoxProps {
  children?: ReactNode;
  label?: string;
  cellWidth?: string | number;
}

export const ScheduleBodyCell = ({
  label,
  children,
  cellWidth = '120px',
  ...rest
}: Props) => (
  <Box
    component="td"
    sx={{
      textAlign: 'left',
      border: '0.5px solid #F1F5F9',
      height: '70px',
      minWidth: cellWidth,
      ':first-child': {
        position: 'sticky',
        left: 0,
        zIndex: 2,
        background: '#fff',
        pl: '1em',
        minWidth: '150px',
        maxWidth: '150px',
      },
    }}
    {...rest}>
    <Typography variant="smallBtnText">{label || children || null}</Typography>
  </Box>
);
