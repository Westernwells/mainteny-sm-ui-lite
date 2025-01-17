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
import {getJobTypeGivenName} from 'utils/service-order-utils';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ServiceOrderIcons} from './ServiceOrderIcons';
import {ServiceOrderTypeText} from './ServiceOrderTypeText';

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

export const NewJobOrderDetails = ({order}: Props) => {
  const {user} = useUserSession();
  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2.5}
      sx={{cursor: 'pointer'}}
      onClick={() => window.open(`/orders/details/${order.id}`, '_blank')}>
      <Box display="flex" gap={1}>
        <ServiceOrderIcons serviceOrderType={order.type} />
        <ServiceOrderTypeText
          serviceOrderType={getJobTypeGivenName(order.type, jobTypes)}
          variant="subtitle1"
          capitalizeText
          style={{color: theme.palette.primary.dark, fontWeight: 'bold'}}
        />
      </Box>

      <Box display="flex" flexDirection="column" gap={1.5}>
        <Detail
          icon={BusinessCenter}
          title={order.elevator.propertyOwner.name}
        />
        <Detail
          icon={LocationOn}
          title={order.elevator.address?.fullName || '-'}
        />
        <Detail
          icon={Business}
          title={order.elevator.additionalInfo.buildingLocation}
        />
        <Detail icon={Tag} title={order.elevator.externalId} />
      </Box>
    </Box>
  );
};
