import Chip from '@mui/material/Chip';
import {useTranslation} from 'react-i18next';
import {ReactNode} from 'react';

const statusWidth = {
  auto: 'auto',
  short: '6rem',
  medium: '8rem',
  long: '10rem',
};

const statusColor = {
  default: 'grey.400',
  primary: 'primary.main',
  secondary: 'secondary.main',
  error: 'error.light',
  info: 'text.secondary',
  success: 'success.main',
  warning: 'warning.light',
};
interface Props {
  label: string | ReactNode;
  style?: {[key: string]: any};
  length?: 'short' | 'medium' | 'long' | 'auto';
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  maxChars?: number;
}

export const StatusChip = ({
  label,
  style,
  maxChars,
  size = 'small',
  color = 'default',
  variant = 'filled',
  length = 'auto',
}: Props) => {
  const {t} = useTranslation();
  return (
    <Chip
      sx={{
        bgcolor: variant === 'filled' ? statusColor[color] : undefined,
        borderColor: variant === 'outlined' ? statusColor[color] : undefined,
        color:
          variant === 'outlined' ? statusColor[color] : 'primary.contrastText',
        minWidth: maxChars ? `calc(${maxChars}ch + .5em)` : statusWidth[length],
        boxShadow: 0,
        px: '0.25em',
        ...style,
      }}
      variant={variant}
      label={typeof label === 'string' ? t(label) : label}
      size={size}
    />
  );
};
