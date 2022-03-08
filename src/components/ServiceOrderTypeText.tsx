import Typography from '@mui/material/Typography';
import {ServiceOrderType} from '../models/service-order';

interface Props {
  serviceOrderType?: ServiceOrderType | null;
  style?: {[key: string]: string | number};
  variant?: any;
}
export const ServiceOrderTypeText = ({
  serviceOrderType,
  style,
  variant,
}: Props) => (
  <Typography variant={variant || 'caption'} sx={{...style}}>
    {serviceOrderType === ServiceOrderType.REGULAR
      ? 'MAINTENANCE'
      : serviceOrderType}
  </Typography>
);
