import {SxProps, Theme} from '@mui/material';
import MuiButton, {ButtonProps} from '@mui/material/Button';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
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
