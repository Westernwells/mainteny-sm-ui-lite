import Chip from '@mui/material/Chip';
import {ReactNode} from 'react';

const statusWidth = {
  short: '6rem',
  medium: '8rem',
  long: '10rem',
};

interface Props {
  label: string | ReactNode;
  style?: {[key: string]: any};
  length?: 'short' | 'medium' | 'long';
  size?: 'small' | 'medium';
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
}

export const StatusChip = ({label, color, length, style, size}: Props) => (
  <Chip
    sx={{width: length ? statusWidth[length] : statusWidth.short, ...style}}
    variant="outlined"
    label={label}
    color={color}
    size={size && size}
  />
);
