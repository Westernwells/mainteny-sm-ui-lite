// import  {ButtonProps} from '@mui/material/Button';
import LoadingButton, {LoadingButtonProps} from '@mui/lab/LoadingButton';
import {ReactNode} from 'react';

interface Props {
  label?: string;
  children?: ReactNode;
  style?: {[key: string]: any};
  buttonProps: LoadingButtonProps;
}

export const Button = ({label, children, style, buttonProps}: Props) => (
  <LoadingButton
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
  </LoadingButton>
);
