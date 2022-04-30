import Button, {ButtonProps} from '@mui/material/Button';
import {ReactNode} from 'react';

const btnSize = {
  small: '1.5rem',
  medium: '2.5rem',
  large: 'default',
};

interface Props extends ButtonProps {
  label?: string;
  children?: ReactNode;
  style?: {[key: string]: string | number};
}

export const CustomButtonUnstyled = ({
  label,
  children,
  style,
  ...rest
}: Props) => (
  <Button
    disableRipple
    disableFocusRipple
    disableElevation
    variant="text"
    sx={{
      textTransform: 'capitalize',
      display: 'flex',
      background: 'transparent',
      border: '1px solid rgba(15, 76, 100, 0.5)',
      minHeight:
        rest.size && btnSize[rest.size] ? btnSize[rest.size] : 'default',
      px: '1.5em',
      '&:hover': {
        background: 'transparent',
      },
      ...style,
    }}
    {...rest}>
    {children || label}
  </Button>
);
