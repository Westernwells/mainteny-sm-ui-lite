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

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const isWebsite = (val: string) =>
    /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(val);

  const handleLink = (val: string) => {
    if (isEmail(val)) {
      return `mailto:${val}`;
    }
    if (isWebsite(val)) {
      return val.startsWith('http') ? val : `https://${val}`;
    }
    return null;
  };

  const link = handleLink(displayValue as string);

  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={1} sx={{minWidth: 200}}>
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
        link ? (
          <Typography
            variant="subtitle2"
            color="#0092B2"
            textAlign="right"
            component="a"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{textDecoration: 'none'}}>
            {displayValue}
          </Typography>
        ) : (
          <Typography
            variant="subtitle2"
            color="primary.dark"
            textAlign="right">
            {displayValue}
          </Typography>
        )
      ) : null}
    </Box>
  );
};
