import Button, {ButtonProps} from '@mui/material/Button';
import {ReactNode} from 'react';

interface Props {
  label?: string;
  children?: ReactNode;
  style?: {[key: string]: any};
  buttonProps: ButtonProps;
}

export const CustomButtonUnstyled = ({
  label,
  children,
  style,
  buttonProps,
}: Props) => (
  <Button
    disableRipple
    disableFocusRipple
    disableElevation
    variant="text"
    size="small"
    sx={{
      ...style,
    }}
    {...buttonProps}>
    {children || label}
  </Button>
);
