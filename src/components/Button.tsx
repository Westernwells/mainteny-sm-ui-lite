import {SxProps, Theme} from '@mui/material';
import MuiButton, {ButtonProps} from '@mui/material/Button';
import {MutableRefObject, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  ref?: MutableRefObject<HTMLButtonElement | null>;
  label?: string;
  children?: ReactNode;
  style?: SxProps<Theme>;
  buttonProps?: ButtonProps;
  disabled?: boolean;
  testId?: string;
  variant?: 'text' | 'outlined' | 'contained';
  enableRipple?: boolean;
}

export const Button = ({
  ref,
  label,
  children,
  style,
  buttonProps,
  disabled,
  testId,
  enableRipple = false,
  variant = 'text',
}: Props) => {
  const {t} = useTranslation();
  return (
    <MuiButton
      ref={ref}
      disabled={disabled}
      disableRipple={!enableRipple}
      data-testid={testId}
      disableFocusRipple
      disableElevation
      variant={variant}
      size="small"
      sx={{
        ...style,
      }}
      {...buttonProps}>
      {children || t(`${label}`)}
    </MuiButton>
  );
};
