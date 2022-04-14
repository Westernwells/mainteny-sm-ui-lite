import Button, {ButtonProps} from '@mui/material/Button';
import {ReactNode} from 'react';

interface Props extends ButtonProps {
  label?: string;
  children?: ReactNode;
}

export const CustomButtonUnstyled = ({label, children, ...rest}: Props) => (
  <Button
    disableRipple
    disableFocusRipple
    disableElevation
    variant="text"
    sx={{
      textTransform: 'capitalize',
      background: 'transparent',
      border: '1px solid rgba(15, 76, 100, 0.5)',
      height: rest.size === 'small' ? '2.5rem' : 'default',
      px: '1.5em',
      '&:hover': {
        background: 'transparent',
      },
    }}
    {...rest}>
    {children || label}
  </Button>
);
