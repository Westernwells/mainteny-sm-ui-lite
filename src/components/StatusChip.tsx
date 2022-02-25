import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

interface Props {
  label: string;
  bgColor?: string;
  textColor?: string;
  style?: {[key: string]: string | number};
  variant?: 'filled' | 'outlined';
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
}

export const StatusChip = ({
  label,
  bgColor,
  color,
  textColor,
  variant,
  style,
}: Props) => (
  <Chip
    variant={variant || 'filled'}
    sx={{
      py: 2,
      color: textColor || '#fff',
      minWidth: '5.75rem',
      backgroundColor: bgColor,
      ...style,
    }}
    color={color}
    label={
      <Typography variant="largeBtnText" sx={{textTransform: 'capitalize'}}>
        {`${label.charAt(0)}${label.slice(1).toLowerCase()}`}
      </Typography>
    }
    size="medium"
  />
);
