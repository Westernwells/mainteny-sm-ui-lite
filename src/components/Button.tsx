import MuiButton, {ButtonProps} from '@mui/material/Button';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  label?: string;
  children?: ReactNode;
  style?: {[key: string]: any};
  buttonProps?: ButtonProps;
  disabled?: boolean;
  testId?: string;
}

export const Button = ({
  label,
  children,
  style,
  buttonProps,
  disabled,
  testId,
}: Props) => {
  const {t} = useTranslation();
  return (
    <MuiButton
      disabled={disabled}
      disableRipple
      data-test-id={testId}
      disableFocusRipple
      disableElevation
      variant="text"
      size="small"
      sx={{
        ...style,
      }}
      {...buttonProps}>
      {children || t(`${label}`)}
    </MuiButton>
  );
};
