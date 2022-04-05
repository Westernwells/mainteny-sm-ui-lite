import Typography from '@mui/material/Typography';
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
        ? capitalize(['MAINTENANCE'])
        : 'MAINTENANCE'
      : capitalizeText
      ? capitalize([serviceOrderType])
      : serviceOrderType}
  </Typography>
);
