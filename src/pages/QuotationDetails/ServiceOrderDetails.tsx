import {Box, Typography} from '@mui/material';
import {Progress} from 'components/Progress';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {StatusChip} from 'components/StatusChip';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';

interface Props {
  serviceOrderId: string;
}

export const ServiceOrderDetails = ({serviceOrderId}: Props) => {
  const formatDate = useFormatDate();
  const {data: serviceOrder, isLoading} =
    useServiceOrderDetails(serviceOrderId);

  if (isLoading)
    return (
      <Box height="8em">
        <Progress height="3em" />
      </Box>
    );

  return (
    <>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box>
          <Typography variant="caption">Order Number</Typography>
          <Typography variant="body2">{serviceOrder?.number}</Typography>
          <Typography variant="caption" color="textSecondary">
            Created on {formatDate(serviceOrder?.meta.createdAt)}
          </Typography>
        </Box>
        {serviceOrder && (
          <StatusChip
            color={getServiceOrderStatusColor(serviceOrder.status)}
            label={serviceOrderStatusToString(serviceOrder.status)}
          />
        )}
      </Box>
      {serviceOrder && (
        <Box display="flex" width="100%">
          <ServiceOrderIcons
            serviceOrderType={serviceOrder.type}
            size="small"
          />
          <ServiceOrderTypeText
            serviceOrderType={serviceOrder.type}
            capitalizeText
            variant="body2"
          />
        </Box>
      )}
      <Typography>{serviceOrder?.description}</Typography>
    </>
  );
};
