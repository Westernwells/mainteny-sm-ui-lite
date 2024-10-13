import {PropsWithChildren, useMemo} from 'react';
import {t} from 'i18next';
import {Box, SvgIconProps, Typography, TypographyProps} from '@mui/material';
import {SvgIconComponent} from '@mui/icons-material';

export interface Props extends PropsWithChildren {
  label: string;
  value?: string | number;
  Icon?: SvgIconComponent;
  iconElement?: JSX.Element;
  showValue?: boolean;
  iconProps?: SvgIconProps;
  labelProps?: TypographyProps;
  translateValue?: boolean;
}

export const CardDataListItem = ({
  label,
  value,
  Icon,
  iconElement,
  showValue = true,
  iconProps = {},
  labelProps,
  translateValue = true,
}: Props) => {
  const displayValue = useMemo(() => {
    if (!value) return '-';
    if (translateValue) return t(`${value}`);
    return value;
  }, [value, translateValue]);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={1}>
        {!!Icon && (
          <Icon
            sx={{color: 'text.disabled', fontSize: '1.3rem', ...iconProps.sx}}
            {...iconProps}
          />
        )}
        {!!iconElement && iconElement}
        <Typography variant="subtitle2" color="text.secondary" {...labelProps}>
          {t(label)}
        </Typography>
      </Box>
      {showValue ? (
        <Typography variant="subtitle2" color="primary.dark">
          {displayValue}
        </Typography>
      ) : null}
    </Box>
  );
};
