import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {capitalize} from 'utils/utils';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
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
}: Props) => {
  const {t} = useTranslation();

  return (
    <Typography variant={variant || 'caption'} sx={{...style}}>
      {serviceOrderType === ServiceOrderType.REGULAR
        ? capitalizeText
          ? t(capitalize(['MAINTENANCE']))
          : t('MAINTENANCE')
        : capitalizeText
        ? serviceOrderType &&
          t(capitalize([serviceOrderTypeToString(serviceOrderType)]))
        : serviceOrderType && t(serviceOrderTypeToString(serviceOrderType))}
    </Typography>
  );
};
