import {theme} from 'theme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  SvgIconComponent,
  BusinessCenter,
  LocationOn,
  Business,
  Tag,
} from '@mui/icons-material';
import {ServiceOrderView} from 'models/service-order';
import {ServiceOrderTypeText} from './ServiceOrderTypeText';
import {ServiceOrderIcons} from './ServiceOrderIcons';

export interface Props {
  order: ServiceOrderView;
}

const Detail = ({
  icon: Icon,
  title,
}: {
  icon: SvgIconComponent;
  title: string;
}) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Icon sx={{color: theme.palette.primary.light}} fontSize="small" />
    <Typography variant="body2" color={theme.palette.primary.dark}>
      {title}
    </Typography>
  </Box>
);

export const NewJobOrderDetails = ({order}: Props) => (
  <Box
    display="flex"
    flexDirection="column"
    gap={2.5}
    sx={{cursor: 'pointer'}}
    onClick={() => window.open(`/orders/details/${order.id}`, '_blank')}>
    <Box display="flex" gap={1}>
      <ServiceOrderIcons serviceOrderType={order.type} />
      <ServiceOrderTypeText
        serviceOrderType={order.type}
        variant="subtitle1"
        capitalizeText
        style={{color: theme.palette.primary.dark, fontWeight: 'bold'}}
      />
    </Box>

    <Box display="flex" flexDirection="column" gap={1.5}>
      <Detail icon={BusinessCenter} title={order.elevator.propertyOwner.name} />
      <Detail
        icon={LocationOn}
        title={order.elevator.address?.fullName || '-'}
      />
      <Detail
        icon={Business}
        title={order.elevator.additionalInfo.buildingLocation}
      />
      <Detail icon={Tag} title={order.elevator.serialNumber} />
    </Box>
  </Box>
);
