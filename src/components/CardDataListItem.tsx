import {PropsWithChildren} from 'react';
import {t} from 'i18next';
import {Box, SvgIconProps, Typography, TypographyProps} from '@mui/material';
import {SvgIconComponent} from '@mui/icons-material';

export interface Props extends PropsWithChildren {
  label: string;
  value?: string | number;
  Icon?: SvgIconComponent;
  showValue?: boolean;
  iconProps?: SvgIconProps;
  labelProps?: TypographyProps;
}

export const CardDataListItem = ({
  label,
  value,
  Icon,
  showValue = true,
  iconProps = {},
  labelProps,
}: Props) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center" gap={1}>
      {!!Icon && (
        <Icon
          sx={{color: 'text.disabled', fontSize: '1.3rem', ...iconProps.sx}}
          {...iconProps}
        />
      )}
      <Typography variant="subtitle2" color="text.secondary" {...labelProps}>
        {t(label)}
      </Typography>
    </Box>
    {showValue ? (
      <Typography variant="subtitle2" color="primary.dark">
        {value ? t(`${value}`) : '-'}
      </Typography>
    ) : null}
  </Box>
);
