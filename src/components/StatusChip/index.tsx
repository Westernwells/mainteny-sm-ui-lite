import Chip from '@mui/material/Chip';
import {useTranslation} from 'react-i18next';
import {ReactNode} from 'react';

const statusWidth = {
  auto: 'auto',
  short: '6rem',
  medium: '8rem',
  long: '10rem',
};

export const statusColor: {[key: string]: string} = {
  default: 'warning.main',
  primary: 'primary.main',
  'primary.mainLight': 'primary.mainLight',
  'primary.light': 'primary.light',
  'primary.main': 'primary.main',
  secondary: 'secondary.main',
  error: 'error.main',
  'error.light': 'error.light',
  info: 'text.secondary',
  success: 'success.main',
  warning: 'warning.main',
  'warning.light': 'warning.light',
  'action.active': 'action.active',
  'eden.light': 'eden.light',
  'warning.dark': 'warning.dark',
  'info.light': 'text.secondary.light',
  darkSuccess: 'success.darkSuccess',
  'primary.dark': 'primary.dark',
  'grey.300': 'grey.300',
  'info.main': 'info.main',
};
interface Props {
  label: string | ReactNode;
  style?: {[key: string]: any};
  length?: 'short' | 'medium' | 'long' | 'auto';
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
  bgColor?: string;
  borderColor?: string;
  color?: string;
  maxChars?: number;
}

export const StatusChip = ({
  label,
  style,
  maxChars,
  size = 'small',
  bgColor,
  borderColor,
  color = 'default',
  variant = 'filled',
  length = 'auto',
}: Props) => {
  const {t} = useTranslation();
  return (
    <Chip
      sx={{
        bgcolor:
          bgColor || (variant === 'filled' ? statusColor[color] : undefined),
        borderColor:
          borderColor ||
          (variant === 'outlined' ? statusColor[color] : undefined),
        color: !(color in statusColor)
          ? color
          : variant === 'outlined'
          ? statusColor[color]
          : 'primary.contrastText',
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
