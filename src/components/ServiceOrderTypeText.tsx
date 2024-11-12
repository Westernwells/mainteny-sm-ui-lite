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
  noWrap?: boolean;
}

export const ServiceOrderTypeText = ({
  serviceOrderType,
  style,
  variant,
  capitalizeText,
  noWrap = false,
}: Props) => {
  const {t} = useTranslation();

  const getServiceOrderLabel = (
    orderType?: string,
    isTextCapitalized?: boolean,
  ) => {
    let label = '-';

    if (orderType === ServiceOrderType.REGULAR) {
      label = 'MAINTENANCE';
    } else if (orderType) {
      const serviceOrderStr = serviceOrderTypeToString(orderType);
      label = serviceOrderStr !== '-' ? serviceOrderStr : orderType;
    }

    if (isTextCapitalized) {
      label = capitalize([label]);
    }

    return t(label);
  };

  return (
    <Typography variant={variant || 'caption'} sx={{...style}} noWrap={noWrap}>
      {getServiceOrderLabel(serviceOrderType || undefined, capitalizeText)}
    </Typography>
  );
};
