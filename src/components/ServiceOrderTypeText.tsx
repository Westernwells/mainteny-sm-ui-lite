import Typography from '@mui/material/Typography';
import {t} from 'i18next';
import {capitalize} from 'utils/utils';
import {ServiceOrderType} from '../models/service-order';

interface Props {
  serviceOrderType?: ServiceOrderType | null;
  style?: {[key: string]: string | number};
  variant?: any;
  capitalizeText?: boolean;
}
export const ServiceOrderTypeText = ({
  serviceOrderType,
  style,
  variant,
  capitalizeText,
}: Props) => (
  <Typography variant={variant || 'caption'} sx={{...style}}>
    {serviceOrderType === ServiceOrderType.REGULAR
      ? capitalizeText
        ? t(capitalize(['MAINTENANCE']))
        : t('MAINTENANCE')
      : capitalizeText
      ? t(capitalize([serviceOrderType]))
      : serviceOrderType && t(serviceOrderType)}
  </Typography>
);
